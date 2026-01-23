import { useState } from 'react'
import { Box, Flex, Text, VStack, SimpleGrid } from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { PageHeader, ActionButton, StatCard } from '../components/common'
import { useStakingStore, type TeamMember } from '../stores/stakingStore'
import {
  HiOutlineUserGroup,
  HiOutlineUserPlus,
  HiOutlineTrophy,
  HiOutlineCurrencyDollar,
  HiOutlineChartBar,
} from 'react-icons/hi2'

const MotionBox = motion.create(Box)

export function TeamPage() {
  const navigate = useNavigate()
  const { teamStats, teamMembers } = useStakingStore()
  const [activeTab, setActiveTab] = useState<'all' | 'direct'>('all')

  const filteredMembers = activeTab === 'direct'
    ? teamMembers.filter((m) => m.level === 1)
    : teamMembers

  return (
    <Box>
      <PageHeader title="团队" />

      <VStack gap="5" p="4" align="stretch">
        {/* 团队等级卡片 */}
        <MotionBox
          bg="linear-gradient(135deg, rgba(139, 92, 246, 0.2) 0%, rgba(217, 70, 239, 0.1) 100%)"
          borderRadius="20px"
          p="5"
          border="1px solid"
          borderColor="rgba(139, 92, 246, 0.3)"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Flex justify="space-between" align="flex-start" mb="4">
            <Box>
              <Text fontSize="sm" color="text.muted" mb="1">
                团队等级
              </Text>
              <Flex align="baseline" gap="2">
                <Text
                  fontSize="3xl"
                  fontWeight="700"
                  color="accent.purple"
                  fontFamily="heading"
                >
                  {teamStats.rank}
                </Text>
              </Flex>
            </Box>
            <Flex
              w="48px"
              h="48px"
              borderRadius="14px"
              bg="rgba(139, 92, 246, 0.2)"
              align="center"
              justify="center"
            >
              <HiOutlineTrophy size={24} color="#8B5CF6" />
            </Flex>
          </Flex>

          <Flex gap="4">
            <Box flex="1">
              <Text fontSize="xs" color="text.muted">
                团队总人数
              </Text>
              <Text fontSize="md" fontWeight="600" color="text.primary">
                {teamStats.totalMembers} 人
              </Text>
            </Box>
            <Box flex="1">
              <Text fontSize="xs" color="text.muted">
                直推人数
              </Text>
              <Text fontSize="md" fontWeight="600" color="accent.cyan">
                {teamStats.directMembers} 人
              </Text>
            </Box>
          </Flex>
        </MotionBox>

        {/* 团队数据统计 */}
        <SimpleGrid columns={2} gap="3">
          <StatCard
            label="团队业绩"
            value={teamStats.teamVolume}
            unit="PFT"
            icon={<HiOutlineChartBar size={18} />}
            color="accent.orange"
            delay={0.1}
          />
          <StatCard
            label="团队收益"
            value={teamStats.teamRewards}
            unit="PFT"
            icon={<HiOutlineCurrencyDollar size={18} />}
            color="accent.green"
            delay={0.15}
          />
        </SimpleGrid>

        {/* 邀请入口 */}
        <ActionButton
          w="100%"
          variant="primary"
          onClick={() => navigate('/invite')}
        >
          <Flex align="center" gap="2">
            <HiOutlineUserPlus size={18} />
            <Text>邀请好友</Text>
          </Flex>
        </ActionButton>

        {/* 团队成员 */}
        <Box>
          <Flex justify="space-between" align="center" mb="3">
            <Text fontSize="sm" fontWeight="600" color="text.secondary">
              团队成员
            </Text>
            <Flex gap="2">
              <FilterTab
                active={activeTab === 'all'}
                onClick={() => setActiveTab('all')}
                label="全部"
              />
              <FilterTab
                active={activeTab === 'direct'}
                onClick={() => setActiveTab('direct')}
                label="直推"
              />
            </Flex>
          </Flex>

          {filteredMembers.length > 0 ? (
            <VStack gap="2" align="stretch">
              {filteredMembers.map((member, index) => (
                <TeamMemberItem key={member.address} member={member} delay={index * 0.05} />
              ))}
            </VStack>
          ) : (
            <EmptyState />
          )}
        </Box>

        {/* 等级说明 */}
        <Box
          bg="bg.card"
          borderRadius="14px"
          p="4"
          border="1px solid"
          borderColor="border.default"
        >
          <Text fontSize="sm" fontWeight="600" color="text.secondary" mb="3">
            团队等级说明
          </Text>
          <VStack gap="3" align="stretch">
            <RankItem rank="Bronze" requirement="直推 5 人" bonus="5%" />
            <RankItem rank="Silver" requirement="直推 10 人，团队 50 人" bonus="8%" />
            <RankItem rank="Gold" requirement="直推 20 人，团队 200 人" bonus="12%" />
            <RankItem rank="Platinum" requirement="直推 50 人，团队 1000 人" bonus="18%" />
            <RankItem rank="Diamond" requirement="直推 100 人，团队 5000 人" bonus="25%" />
          </VStack>
        </Box>
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
      px="3"
      py="1"
      borderRadius="8px"
      bg={active ? 'brand.primary' : 'transparent'}
      color={active ? 'white' : 'text.muted'}
      fontSize="xs"
      fontWeight="600"
      cursor="pointer"
      transition="all 0.2s"
      onClick={onClick}
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
  const levelColors = ['accent.cyan', 'accent.green', 'accent.orange']
  const levelLabels = ['直推', '2级', '3级']

  return (
    <MotionBox
      bg="bg.card"
      borderRadius="12px"
      p="3"
      border="1px solid"
      borderColor="border.default"
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay }}
    >
      <Flex justify="space-between" align="center">
        <Flex align="center" gap="3">
          <Flex
            w="40px"
            h="40px"
            borderRadius="10px"
            bg="bg.input"
            align="center"
            justify="center"
          >
            <HiOutlineUserGroup size={20} color="#A1A1AA" />
          </Flex>
          <Box>
            <Text fontSize="sm" fontWeight="600" color="text.primary">
              {member.shortAddress}
            </Text>
            <Flex align="center" gap="2">
              <Text
                fontSize="10px"
                px="1.5"
                py="0.5"
                borderRadius="4px"
                bg={`rgba(${levelColors[member.level - 1]}, 0.2)`}
                color={levelColors[member.level - 1]}
                fontWeight="600"
              >
                {levelLabels[member.level - 1] || `${member.level}级`}
              </Text>
              <Text fontSize="xs" color="text.muted">
                贡献 {member.contribution} PFT
              </Text>
            </Flex>
          </Box>
        </Flex>
        <Text fontSize="xs" color="text.muted">
          {formatDate(member.joinedAt)}
        </Text>
      </Flex>
    </MotionBox>
  )
}

function EmptyState() {
  return (
    <Flex
      direction="column"
      align="center"
      justify="center"
      py="8"
      bg="bg.card"
      borderRadius="14px"
      border="1px dashed"
      borderColor="border.default"
    >
      <HiOutlineUserGroup size={32} color="#71717A" />
      <Text fontSize="sm" color="text.muted" mt="2">
        暂无团队成员
      </Text>
      <Text fontSize="xs" color="text.disabled" mt="1">
        邀请好友加入你的团队
      </Text>
    </Flex>
  )
}

interface RankItemProps {
  rank: string
  requirement: string
  bonus: string
}

function RankItem({ rank, requirement, bonus }: RankItemProps) {
  const rankColors: Record<string, string> = {
    Bronze: 'rgba(205, 127, 50, 0.8)',
    Silver: 'rgba(192, 192, 192, 0.8)',
    Gold: 'rgba(255, 215, 0, 0.8)',
    Platinum: 'rgba(229, 228, 226, 0.8)',
    Diamond: 'rgba(185, 242, 255, 0.8)',
  }

  return (
    <Flex justify="space-between" align="center">
      <Flex align="center" gap="2">
        <Box
          w="8px"
          h="8px"
          borderRadius="full"
          bg={rankColors[rank] || '#71717A'}
        />
        <Text fontSize="xs" color="text.primary" fontWeight="500">
          {rank}
        </Text>
      </Flex>
      <Text fontSize="xs" color="text.muted" flex="1" textAlign="center">
        {requirement}
      </Text>
      <Text fontSize="xs" color="accent.green" fontWeight="600">
        +{bonus}
      </Text>
    </Flex>
  )
}

function formatDate(timestamp: number): string {
  const date = new Date(timestamp)
  const month = date.getMonth() + 1
  const day = date.getDate()
  return `${month}/${day}`
}
