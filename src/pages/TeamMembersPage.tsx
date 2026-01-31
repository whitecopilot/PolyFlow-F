// 团队成员页面 - 二级页面

import { Box, Flex, HStack, Text, VStack } from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { HiOutlineUserGroup } from 'react-icons/hi2'
import { useTranslation } from 'react-i18next'
import { CombinedBadges } from '../components/common'
import { SecondaryPageHeader } from '../components/layout'
import { usePayFiStore } from '../stores/payfiStore'
import { isUserActivated, type TeamMember } from '../types/payfi'

const MotionBox = motion.create(Box)

export function TeamMembersPage() {
  const { t } = useTranslation()
  const { teamStats, teamMembers, fetchTeamMembers } = usePayFiStore()
  const [activeTab, setActiveTab] = useState<'all' | 'direct'>('all')
  const fetchedRef = useRef(false)

  useEffect(() => {
    // 防止 React Strict Mode 双重调用
    if (fetchedRef.current) return
    fetchedRef.current = true
    fetchTeamMembers()
  }, [fetchTeamMembers])

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
                <TeamMemberItem key={member.id} member={member} delay={index * 0.03} />
              ))}
          </VStack>
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

interface TeamMemberItemProps {
  member: TeamMember
  delay: number
}

function TeamMemberItem({ member, delay }: TeamMemberItemProps) {
  const { t } = useTranslation()

  // 确保成员数据有效
  if (!member || !member.address) {
    return null
  }

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
        <VStack align="end" gap={0} flexShrink={0}>
          <Text
            fontSize="sm"
            fontWeight="600"
            color={isUserActivated(member.state) ? 'white' : 'whiteAlpha.500'}
          >
            {isUserActivated(member.state) ? t('team_members.activated') : t('team_members.not_activated')}
          </Text>
          <Text fontSize="xs" color="whiteAlpha.500">
            {member.joinedAt ? formatDate(member.joinedAt) : '-'}
          </Text>
        </VStack>
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
