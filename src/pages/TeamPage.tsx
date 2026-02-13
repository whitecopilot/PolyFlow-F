// 团队页面 - 节点帝国

import { Box, Flex, HStack, SimpleGrid, Text, VStack } from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import {
  HiOutlineArrowTrendingUp,
  HiOutlineChartBar,
  HiOutlineCheckCircle,
  HiOutlineChevronRight,
  HiOutlineCog6Tooth,
  HiOutlineCurrencyDollar,
  HiOutlineDocumentText,
  HiOutlineTrophy,
  HiOutlineUserGroup,
  HiOutlineUserPlus,
  HiOutlineXCircle,
} from 'react-icons/hi2'
import { useNavigate } from 'react-router-dom'
import { AdminType } from '../api/types'
import {
  ActionButton,
  GradientBorderCard,
  NodeBadge,
  PageHeader,
} from '../components/common'
import { usePayFiStore } from '../stores/payfiStore'

const MotionBox = motion.create(Box)

export function TeamPage() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()

  // 单位转换：中文/日文使用"万"，英文/韩文使用"K"（千）
  // 1 万 = 10K，所以非中日环境下配置值需要乘以 10
  const isWanUnit = ['zh-Hans', 'zh-Hant', 'ja'].includes(i18n.language)
  // 配置值转换（配置以"万"为单位存储）
  const formatConfigValue = (value: number) => isWanUnit ? value : value * 10
  // 业绩值转换（业绩以 USDT 为单位存储）
  const formatPerfValue = (value: number) => isWanUnit ? value / 10000 : value / 1000
  const {
    userAssets,
    teamStats,
    nodeLevelConfigs,
    fetchTeamStats,
    fetchNodeLevelConfigs,
  } = usePayFiStore()

  // 是否为超级管理员（从 /assets 接口返回的 adminType 判断）
  const isSuperAdmin = userAssets?.adminType === AdminType.SuperAdmin
  const fetchedRef = useRef(false)

  useEffect(() => {
    // 防止 React Strict Mode 双重调用
    if (fetchedRef.current) return
    fetchedRef.current = true
    fetchTeamStats()
    fetchNodeLevelConfigs()
  }, [fetchTeamStats, fetchNodeLevelConfigs])

  // 获取下一个节点等级配置
  const getNextNodeLevel = (currentLevel: string) => {
    if (nodeLevelConfigs.length === 0) return null
    // 从 P0-P9 格式中提取数字
    const currentLevelNum = parseInt(currentLevel.replace('P', ''), 10) || 0
    // 查找下一等级
    return nodeLevelConfigs.find(c => c.level === currentLevelNum + 1) || null
  }

  const nextNodeConfig = getNextNodeLevel(teamStats?.nodeLevel || 'P0')

  // 计算升级进度
  const smallAreaProgress = nextNodeConfig && teamStats
    ? Math.min((teamStats.smallAreaPerf / 10000 / nextNodeConfig.smallAreaReq) * 100, 100)
    : 100

  const totalPerfProgress = nextNodeConfig && teamStats
    ? Math.min((teamStats.teamPerformance / 10000 / nextNodeConfig.totalReq) * 100, 100)
    : 100

  return (
    <Box minH="100vh" bg="#111111">
      <PageHeader title={t('nav.team')} />

      <VStack gap="5" p="4" align="stretch">
        {/* 节点等级卡片 */}
        <GradientBorderCard glowIntensity="high">
          <MotionBox
            p="5"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Flex justify="space-between" align="flex-start" mb="4">
              <VStack align="start" gap={2}>
                {/* <Text fontSize="sm" color="whiteAlpha.600">
                  {t('team.node_level')}
                </Text> */}
                <NodeBadge
                  level={teamStats?.nodeLevel || 'P0'}
                  size="lg"
                  showName
                />
              </VStack>
            </Flex>

            {/* 升级提示 */}
            {nextNodeConfig && (
              <Box
                bg="whiteAlpha.50"
                borderRadius="lg"
                p="3"
              >
                <Text fontSize="xs" color="whiteAlpha.600" mb="2">
                  {t('team.upgrade_to', { level: nextNodeConfig.level })}
                </Text>
                <SimpleGrid columns={2} gap={3}>
                  <Box>
                    <Text fontSize="xs" color="whiteAlpha.500">{t('team.small_area_perf')}</Text>
                    <Text fontSize="sm" color={smallAreaProgress >= 100 ? '#22C55E' : 'white'}>
                      {formatPerfValue(teamStats?.smallAreaPerf || 0)}{t('team.ten_thousand')} / {formatConfigValue(nextNodeConfig.smallAreaReq)}{t('team.ten_thousand')}
                    </Text>
                  </Box>
                  <Box>
                    <Text fontSize="xs" color="whiteAlpha.500">{t('team.total_perf')}</Text>
                    <Text fontSize="sm" color={totalPerfProgress >= 100 ? '#22C55E' : 'white'}>
                      {formatPerfValue(teamStats?.teamPerformance || 0)}{t('team.ten_thousand')} / {formatConfigValue(nextNodeConfig.totalReq)}{t('team.ten_thousand')}
                    </Text>
                  </Box>
                </SimpleGrid>
              </Box>
            )}
          </MotionBox>
        </GradientBorderCard>

        {/* 邀请入口 - 未激活用户禁用 */}
        <ActionButton
          w="full"
          variant="primary"
          disabled={!userAssets?.is_active}
          onClick={() => navigate('/invite')}
        >
          <HStack gap={2}>
            <HiOutlineUserPlus size={18} />
            <Text>{t('home.invite_friends')}</Text>
            {!userAssets?.is_active && (
              <Text fontSize="xs" color="whiteAlpha.500">
                ({t('home.invite_disabled_hint')})
              </Text>
            )}
          </HStack>
        </ActionButton>

        {/* 业绩统计 */}
        <Box>
          <Text fontSize="sm" fontWeight="600" color="whiteAlpha.600" mb="3">
            {t('team.performance_stats')}
          </Text>

          <SimpleGrid columns={2} gap="3">
            {/* 邀请业绩卡片 */}
            <MotionBox
              bg="#17171C"
              borderRadius="xl"
              p="4"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
            >
              <HStack gap={2} mb={2}>
                <HiOutlineCurrencyDollar size={16} color="#8A8A90" />
                <Text fontSize="xs" color="whiteAlpha.600">{t('team.invite_performance')}</Text>
              </HStack>
              <Text fontSize="xl" fontWeight="bold" color="white" mb={2}>
                ${(teamStats?.directPerformance || 0).toLocaleString()}
              </Text>
              <VStack align="start" gap={1}>
                <HStack gap={1}>
                  <HiOutlineDocumentText size={12} color="#8A8A90" />
                  <Text fontSize="xs" color="whiteAlpha.500">
                    {t('team.invite_orders')} {teamStats?.directOrderCount || 0} {t('team.order_unit')}
                  </Text>
                </HStack>
              </VStack>
            </MotionBox>

            {/* 团队总业绩卡片 */}
            <MotionBox
              bg="#17171C"
              borderRadius="xl"
              p="4"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08 }}
            >
              <HStack gap={2} mb={2}>
                <HiOutlineCurrencyDollar size={16} color="#8A8A90" />
                <Text fontSize="xs" color="whiteAlpha.600">{t('team.team_sales_perf')}</Text>
              </HStack>
              <Text fontSize="xl" fontWeight="bold" color="white">
                ${(teamStats?.teamSalesPerformance || 0).toLocaleString()}
              </Text>
            </MotionBox>
            <MotionBox
              bg="#17171C"
              borderRadius="xl"
              p="4"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              cursor="pointer"
              onClick={() => navigate('/team-performance')}
              _hover={{ bg: '#1f1f26' }}
            >
              <Flex justify="space-between" align="flex-start">
                <Box>
                  <HStack gap={2} mb={2}>
                    <HiOutlineChartBar size={16} color="#8A8A90" />
                    <Text fontSize="xs" color="whiteAlpha.600">{t('team.team_total_perf')}</Text>
                  </HStack>
                  <Text fontSize="xl" fontWeight="bold" color="white">
                    ${(teamStats?.teamPerformance || 0).toLocaleString()}
                  </Text>
                </Box>
                <Box color="whiteAlpha.400" mt="1">
                  <HiOutlineChevronRight size={16} />
                </Box>
              </Flex>
            </MotionBox>

            <MotionBox
              bg="#17171C"
              borderRadius="xl"
              p="4"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
            >
              <HStack gap={2} mb={2}>
                <HiOutlineArrowTrendingUp size={16} color="#8A8A90" />
                <Text fontSize="xs" color="whiteAlpha.600">{t('team.max_line_perf_value')}</Text>
              </HStack>
              <Text fontSize="xl" fontWeight="bold" color="white">
                ${(teamStats?.todayStakingAmount || 0).toLocaleString()}
              </Text>
            </MotionBox>

            <MotionBox
              bg="#17171C"
              borderRadius="xl"
              p="4"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <HStack gap={2} mb={2}>
                <HiOutlineTrophy size={16} color="#8A8A90" />
                <Text fontSize="xs" color="whiteAlpha.600">{t('team.small_area_perf_value')}</Text>
              </HStack>
              <Text fontSize="xl" fontWeight="bold" color="white">
                ${(teamStats?.smallAreaPerf || 0).toLocaleString()}
              </Text>
            </MotionBox>

            <MotionBox
              bg="#17171C"
              borderRadius="xl"
              p="4"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              cursor="pointer"
              onClick={() => navigate('/team-members')}
              _hover={{ bg: '#1f1f26' }}
            >
              <Flex justify="space-between" align="flex-start">
                <Box>
                  <HStack gap={2} mb={2}>
                    <HiOutlineUserGroup size={16} color="#8A8A90" />
                    <Text fontSize="xs" color="whiteAlpha.600">{t('team.community_count')}</Text>
                  </HStack>
                  <Text fontSize="xl" fontWeight="bold" color="white">
                    {teamStats?.teamCount || 0}
                    <Text as="span" fontSize="sm" color="whiteAlpha.500" ml={1}>
                      {t('team.invite')} {teamStats?.directCount || 0}
                    </Text>
                  </Text>
                </Box>
                <Box color="whiteAlpha.400" mt="1">
                  <HiOutlineChevronRight size={16} />
                </Box>
              </Flex>
            </MotionBox>
          </SimpleGrid>
        </Box>

        {/* 等级条件 */}
        {nextNodeConfig && (
          <Box>
            <Text fontSize="sm" fontWeight="600" color="whiteAlpha.600" mb="3">
              {t('team.upgrade_requirements', { level: nextNodeConfig.level })}
            </Text>
            <MotionBox
              bg="#17171C"
              borderRadius="xl"
              p="4"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <VStack gap={3} align="stretch">
                <Flex justify="space-between" align="center">
                  <HStack gap={2}>
                    {smallAreaProgress >= 100 ? (
                      <HiOutlineCheckCircle size={18} color="#22C55E" />
                    ) : (
                      <HiOutlineXCircle size={18} color="#71717A" />
                    )}
                    <Text fontSize="sm" color="white">
                      {t('team.small_area_req', { req: formatConfigValue(nextNodeConfig.smallAreaReq) })}
                    </Text>
                  </HStack>
                  <Text fontSize="sm" color={smallAreaProgress >= 100 ? '#22C55E' : 'whiteAlpha.500'}>
                    {formatPerfValue(teamStats?.smallAreaPerf || 0)}{t('team.ten_thousand')}
                  </Text>
                </Flex>

                <Flex justify="space-between" align="center">
                  <HStack gap={2}>
                    {totalPerfProgress >= 100 ? (
                      <HiOutlineCheckCircle size={18} color="#22C55E" />
                    ) : (
                      <HiOutlineXCircle size={18} color="#71717A" />
                    )}
                    <Text fontSize="sm" color="white">
                      {t('team.total_req', { req: formatConfigValue(nextNodeConfig.totalReq) })}
                    </Text>
                  </HStack>
                  <Text fontSize="sm" color={totalPerfProgress >= 100 ? '#22C55E' : 'whiteAlpha.500'}>
                    {formatPerfValue(teamStats?.teamPerformance || 0)}{t('team.ten_thousand')}
                  </Text>
                </Flex>

                {nextNodeConfig.level === 9 && (
                  <Flex justify="space-between" align="center">
                    <HStack gap={2}>
                      <HiOutlineXCircle size={18} color="#71717A" />
                      <Text fontSize="sm" color="white">
                        {t('team.p9_special_req')}
                      </Text>
                    </HStack>
                    <Text fontSize="sm" color="whiteAlpha.500">
                      0 {t('team.units')}
                    </Text>
                  </Flex>
                )}
              </VStack>
            </MotionBox>
          </Box>
        )}

        {/* 管理员数据入口 - 仅超级管理员可见 */}
        {isSuperAdmin && (
          <MotionBox
            bg="#17171C"
            borderRadius="xl"
            p="4"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            cursor="pointer"
            onClick={() => navigate('/admin-data')}
            _hover={{ bg: '#1f1f26' }}
          >
            <Flex justify="space-between" align="center">
              <HStack gap={3}>
                <Box
                  bg="orange.500/20"
                  p="2"
                  borderRadius="lg"
                >
                  <HiOutlineCog6Tooth size={20} color="#F97316" />
                </Box>
                <VStack align="start" gap={0}>
                  <Text fontSize="sm" fontWeight="600" color="white">
                    {t('team.admin_data')}
                  </Text>
                  <Text fontSize="xs" color="whiteAlpha.500">
                    {t('team.admin_data_desc')}
                  </Text>
                </VStack>
              </HStack>
              <Box color="whiteAlpha.400">
                <HiOutlineChevronRight size={16} />
              </Box>
            </Flex>
          </MotionBox>
        )}

        {/* 底部间距 */}
        <Box h="24" />
      </VStack>
    </Box>
  )
}
