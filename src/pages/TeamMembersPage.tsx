// 团队成员页面 - 二级页面

import { Box, Flex, Text, VStack, HStack } from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import { SecondaryPageHeader } from '../components/layout'
import { CombinedBadges } from '../components/common'
import { usePayFiStore } from '../stores/payfiStore'
import type { TeamMember } from '../types/payfi'
import { HiOutlineUserGroup } from 'react-icons/hi2'

const MotionBox = motion.create(Box)

export function TeamMembersPage() {
  const { teamStats, teamMembers, fetchTeamMembers } = usePayFiStore()
  const [activeTab, setActiveTab] = useState<'all' | 'direct'>('all')

  useEffect(() => {
    fetchTeamMembers()
  }, [fetchTeamMembers])

  const filteredMembers =
    activeTab === 'direct'
      ? teamMembers.filter((m) => m.isDirectReferral)
      : teamMembers

  const directCount = teamMembers.filter((m) => m.isDirectReferral).length

  return (
    <Box minH="100vh" bg="black">
      <SecondaryPageHeader title="团队成员" />

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
                bg="rgba(6, 182, 212, 0.15)"
                align="center"
                justify="center"
              >
                <HiOutlineUserGroup size={20} color="#06B6D4" />
              </Flex>
              <Box>
                <Text fontSize="sm" color="whiteAlpha.600">
                  团队人数
                </Text>
                <Text fontSize="xl" fontWeight="bold" color="white">
                  {teamStats?.teamCount || teamMembers.length} 人
                </Text>
              </Box>
            </HStack>
            <VStack align="end" gap={0}>
              <Text fontSize="sm" color="#D811F0">
                直推 {directCount} 人
              </Text>
              <Text fontSize="xs" color="whiteAlpha.500">
                间推 {(teamStats?.teamCount || teamMembers.length) - directCount} 人
              </Text>
            </VStack>
          </Flex>
        </MotionBox>

        {/* 筛选标签 */}
        <HStack gap={2}>
          <FilterTab
            active={activeTab === 'all'}
            onClick={() => setActiveTab('all')}
            label={`全部 (${teamStats?.teamCount || teamMembers.length})`}
          />
          <FilterTab
            active={activeTab === 'direct'}
            onClick={() => setActiveTab('direct')}
            label={`直推 (${directCount})`}
          />
        </HStack>

        {/* 成员列表 */}
        {filteredMembers.length > 0 ? (
          <VStack gap={3} align="stretch">
            {filteredMembers.map((member, index) => (
              <TeamMemberItem key={member.id} member={member} delay={index * 0.02} />
            ))}
          </VStack>
        ) : (
          <EmptyState activeTab={activeTab} />
        )}

        {/* 底部间距 */}
        <Box h="8" />
      </VStack>
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
      bg={active ? '#292FE1' : 'whiteAlpha.100'}
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

interface TeamMemberItemProps {
  member: TeamMember
  delay: number
}

function TeamMemberItem({ member, delay }: TeamMemberItemProps) {
  return (
    <MotionBox
      bg="#17171C"
      borderRadius="xl"
      p="4"
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay }}
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
          >
            <HiOutlineUserGroup size={22} color="#71717A" />
          </Flex>
          <Box>
            <Text fontSize="sm" fontWeight="600" color="white">
              {member.address}
            </Text>
            <HStack gap={2} mt={1}>
              <CombinedBadges
                nftLevel={member.nftLevel}
                nodeLevel={member.nodeLevel}
                size="sm"
              />
              {member.isDirectReferral && (
                <Text fontSize="10px" color="#D811F0" fontWeight="600">
                  直推
                </Text>
              )}
            </HStack>
          </Box>
        </HStack>
        <VStack align="end" gap={0}>
          <Text fontSize="sm" fontWeight="600" color="#22C55E">
            ${member.performance.toLocaleString()}
          </Text>
          <Text fontSize="xs" color="whiteAlpha.500">
            {formatDate(member.joinedAt)}
          </Text>
        </VStack>
      </Flex>
    </MotionBox>
  )
}

function EmptyState({ activeTab }: { activeTab: 'all' | 'direct' }) {
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
        {activeTab === 'direct' ? '暂无直推成员' : '暂无团队成员'}
      </Text>
      <Text fontSize="xs" color="whiteAlpha.300" mt="1">
        邀请好友加入你的团队
      </Text>
    </Flex>
  )
}

function formatDate(date: Date): string {
  const d = new Date(date)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}
