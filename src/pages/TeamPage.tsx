// 团队页面 - 节点帝国

import { Box, Flex, HStack, SimpleGrid, Text, VStack } from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { useEffect } from 'react'
import {
  HiOutlineArrowTrendingUp,
  HiOutlineChartBar,
  HiOutlineCheckCircle,
  HiOutlineChevronRight,
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
import { usePayFiStore } from '../stores/payfiStore'

const MotionBox = motion.create(Box)

export function TeamPage() {
  const navigate = useNavigate()
  const {
    teamStats,
    fetchTeamStats,
  } = usePayFiStore()

  useEffect(() => {
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
    <Box minH="100vh" bg="black">
      <PageHeader title="我的" />

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
                <Text fontSize="sm" color="whiteAlpha.600">
                  🏛️ 节点等级
                </Text>
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
                  升级到 {nextNodeConfig.level} 还需:
                </Text>
                <SimpleGrid columns={2} gap={3}>
                  <Box>
                    <Text fontSize="xs" color="whiteAlpha.500">小区业绩</Text>
                    <Text fontSize="sm" color={smallAreaProgress >= 100 ? '#22C55E' : 'white'}>
                      {(teamStats?.smallAreaPerf || 0) / 10000}万 / {nextNodeConfig.smallAreaReq}万
                    </Text>
                  </Box>
                  <Box>
                    <Text fontSize="xs" color="whiteAlpha.500">总业绩</Text>
                    <Text fontSize="sm" color={totalPerfProgress >= 100 ? '#22C55E' : 'white'}>
                      {(teamStats?.teamPerformance || 0) / 10000}万 / {nextNodeConfig.totalReq}万
                    </Text>
                  </Box>
                </SimpleGrid>
              </Box>
            )}
          </MotionBox>
        </GradientBorderCard>

        {/* 邀请入口 - 放在卡片和业绩统计之间 */}
        <ActionButton
          w="full"
          variant="primary"
          onClick={() => navigate('/invite')}
        >
          <HStack gap={2}>
            <HiOutlineUserPlus size={18} />
            <Text>邀请好友</Text>
          </HStack>
        </ActionButton>

        {/* 业绩统计 */}
        <Box>
          <Text fontSize="sm" fontWeight="600" color="whiteAlpha.600" mb="3">
            业绩统计
          </Text>
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
                <HiOutlineChartBar size={16} color="#D811F0" />
                <Text fontSize="xs" color="whiteAlpha.600">团队总业绩</Text>
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
                <HiOutlineArrowTrendingUp size={16} color="#22C55E" />
                <Text fontSize="xs" color="whiteAlpha.600">竟升算力值</Text>
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
              transition={{ delay: 0.2 }}
            >
              <HStack gap={2} mb={2}>
                <HiOutlineTrophy size={16} color="#EAB308" />
                <Text fontSize="xs" color="whiteAlpha.600">日新增算力值</Text>
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
              transition={{ delay: 0.25 }}
              cursor="pointer"
              onClick={() => navigate('/team-members')}
              _hover={{ bg: '#1f1f26' }}
            >
              <Flex justify="space-between" align="flex-start">
                <Box>
                  <HStack gap={2} mb={2}>
                    <HiOutlineUserGroup size={16} color="#06B6D4" />
                    <Text fontSize="xs" color="whiteAlpha.600">社区人数</Text>
                  </HStack>
                  <Text fontSize="xl" fontWeight="bold" color="white">
                    {teamStats?.teamCount || 0}
                    <Text as="span" fontSize="sm" color="whiteAlpha.500" ml={1}>
                      邀请 {teamStats?.directCount || 0}
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
              {nextNodeConfig.level} 升级条件
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
                      竟升算力值 ≥ {nextNodeConfig.smallAreaReq}万
                    </Text>
                  </HStack>
                  <Text fontSize="sm" color={smallAreaProgress >= 100 ? '#22C55E' : 'whiteAlpha.500'}>
                    {(teamStats?.smallAreaPerf || 0) / 10000}万
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
                      总算力值 ≥ {nextNodeConfig.totalReq}万
                    </Text>
                  </HStack>
                  <Text fontSize="sm" color={totalPerfProgress >= 100 ? '#22C55E' : 'whiteAlpha.500'}>
                    {(teamStats?.teamPerformance || 0) / 10000}万
                  </Text>
                </Flex>

                {nextNodeConfig.level === 'P9' && (
                  <Flex justify="space-between" align="center">
                    <HStack gap={2}>
                      <HiOutlineXCircle size={18} color="#71717A" />
                      <Text fontSize="sm" color="white">
                        团队内 ≥ 2 个 P8
                      </Text>
                    </HStack>
                    <Text fontSize="sm" color="whiteAlpha.500">
                      0 个
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

