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
  HiOutlineCurrencyDollar,
  HiOutlineDocumentText,
  HiOutlineTrophy,
  HiOutlineUserGroup,
  HiOutlineUserPlus,
  HiOutlineXCircle,
} from 'react-icons/hi2'
import { useNavigate } from 'react-router-dom'
import {
  ActionButton,
  GradientBorderCard,
  NodeBadge,
  PageHeader,
} from '../components/common'
import { getNextNodeLevel } from '../mocks/payfiConfig'
import { useAuthStore } from '../stores/authStore'
import { usePayFiStore } from '../stores/payfiStore'

const MotionBox = motion.create(Box)

export function TeamPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const {
    teamStats,
    fetchTeamStats,
  } = usePayFiStore()
  const fetchedRef = useRef(false)

  useEffect(() => {
    // 防止 React Strict Mode 双重调用
    if (fetchedRef.current) return
    fetchedRef.current = true
    fetchTeamStats()
  }, [fetchTeamStats])

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
                      {(teamStats?.smallAreaPerf || 0) / 10000}{t('team.ten_thousand')} / {nextNodeConfig.smallAreaReq}{t('team.ten_thousand')}
                    </Text>
                  </Box>
                  <Box>
                    <Text fontSize="xs" color="whiteAlpha.500">{t('team.total_perf')}</Text>
                    <Text fontSize="sm" color={totalPerfProgress >= 100 ? '#22C55E' : 'white'}>
                      {(teamStats?.teamPerformance || 0) / 10000}{t('team.ten_thousand')} / {nextNodeConfig.totalReq}{t('team.ten_thousand')}
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
          disabled={!user?.is_active}
          onClick={() => navigate('/invite')}
        >
          <HStack gap={2}>
            <HiOutlineUserPlus size={18} />
            <Text>{t('home.invite_friends')}</Text>
            {!user?.is_active && (
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

          {/* 邀请业绩卡片 - 跨两列 */}
          <MotionBox
            bg="#17171C"
            borderRadius="xl"
            p="4"
            mb="3"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
          >
            <HStack gap={2} mb={3}>
              <HiOutlineCurrencyDollar size={16} color="#8A8A90" />
              <Text fontSize="xs" color="whiteAlpha.600">{t('team.invite_performance')}</Text>
            </HStack>
            <Text fontSize="2xl" fontWeight="bold" color="white" mb={3}>
              ${(teamStats?.directPerformance || 0).toLocaleString()}
            </Text>
            <Flex gap={4}>
              <HStack gap={1}>
                <HiOutlineUserPlus size={14} color="#8A8A90" />
                <Text fontSize="xs" color="whiteAlpha.500">{t('team.invite_count')}</Text>
                <Text fontSize="sm" fontWeight="600" color="white">
                  {' '}{teamStats?.directCount || 0}{' '}
                  <Text as="span" fontSize="xs" color="whiteAlpha.400">{t('team.person_unit')}</Text>
                </Text>
              </HStack>
              <HStack gap={1}>
                <HiOutlineDocumentText size={14} color="#8A8A90" />
                <Text fontSize="xs" color="whiteAlpha.500">{t('team.invite_orders')}</Text>
                <Text fontSize="sm" fontWeight="600" color="white">
                  {' '}{teamStats?.directOrderCount || 0}{' '}
                  <Text as="span" fontSize="xs" color="whiteAlpha.400">{t('team.order_unit')}</Text>
                </Text>
              </HStack>
            </Flex>
          </MotionBox>

          <SimpleGrid columns={2} gap="3">
            <MotionBox
              bg="#17171C"
              borderRadius="xl"
              p="4"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <HStack gap={2} mb={2}>
                <HiOutlineChartBar size={16} color="#8A8A90" />
                <Text fontSize="xs" color="whiteAlpha.600">{t('team.team_total_perf')}</Text>
              </HStack>
              <Text fontSize="xl" fontWeight="bold" color="white">
                ${(teamStats?.teamPerformance || 0).toLocaleString()}
              </Text>
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
                ${(teamStats?.maxLinePerf || 0).toLocaleString()}
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
                      {t('team.small_area_req', { req: nextNodeConfig.smallAreaReq })}
                    </Text>
                  </HStack>
                  <Text fontSize="sm" color={smallAreaProgress >= 100 ? '#22C55E' : 'whiteAlpha.500'}>
                    {(teamStats?.smallAreaPerf || 0) / 10000}{t('team.ten_thousand')}
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
                      {t('team.total_req', { req: nextNodeConfig.totalReq })}
                    </Text>
                  </HStack>
                  <Text fontSize="sm" color={totalPerfProgress >= 100 ? '#22C55E' : 'whiteAlpha.500'}>
                    {(teamStats?.teamPerformance || 0) / 10000}{t('team.ten_thousand')}
                  </Text>
                </Flex>

                {nextNodeConfig.level === 'P9' && (
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

        {/* 底部间距 */}
        <Box h="24" />
      </VStack>
    </Box>
  )
}
