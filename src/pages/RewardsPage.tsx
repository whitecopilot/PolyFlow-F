import { useState } from 'react'
import { Box, Flex, Text, VStack, SimpleGrid } from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { PageHeader, ActionButton, StatCard } from '../components/common'
import { useStakingStore } from '../stores/stakingStore'
import {
  HiOutlineGift,
  HiOutlineSparkles,
  HiOutlineClock,
  HiOutlineArrowTrendingUp,
  HiOutlineCalendarDays,
} from 'react-icons/hi2'

const MotionBox = motion.create(Box)

interface RewardRecord {
  id: string
  type: 'staking' | 'team' | 'bonus'
  amount: string
  date: string
  status: 'claimed' | 'pending'
}

// 模拟收益记录
const mockRewardRecords: RewardRecord[] = [
  { id: '1', type: 'staking', amount: '12.34', date: '2024-01-15', status: 'claimed' },
  { id: '2', type: 'team', amount: '5.67', date: '2024-01-15', status: 'claimed' },
  { id: '3', type: 'staking', amount: '12.34', date: '2024-01-14', status: 'claimed' },
  { id: '4', type: 'bonus', amount: '100.00', date: '2024-01-13', status: 'claimed' },
  { id: '5', type: 'staking', amount: '12.34', date: '2024-01-13', status: 'claimed' },
]

export function RewardsPage() {
  const { stakingInfo, claimRewards } = useStakingStore()
  const [isClaiming, setIsClaiming] = useState(false)

  const handleClaim = async () => {
    if (parseFloat(stakingInfo.pendingRewards) <= 0) return
    setIsClaiming(true)
    await new Promise((r) => setTimeout(r, 1500))
    claimRewards()
    setIsClaiming(false)
  }

  return (
    <Box>
      <PageHeader title="收益" />

      <VStack gap="5" p="4" align="stretch">
        {/* 待领取收益卡片 */}
        <MotionBox
          bg="linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(79, 70, 229, 0.1) 100%)"
          borderRadius="20px"
          p="5"
          border="1px solid"
          borderColor="rgba(16, 185, 129, 0.3)"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Flex justify="space-between" align="flex-start" mb="4">
            <Box>
              <Text fontSize="sm" color="text.muted" mb="1">
                待领取收益
              </Text>
              <Flex align="baseline" gap="2">
                <Text
                  fontSize="3xl"
                  fontWeight="700"
                  color="accent.green"
                  fontFamily="heading"
                >
                  {stakingInfo.pendingRewards}
                </Text>
                <Text fontSize="sm" color="text.secondary">
                  PFT
                </Text>
              </Flex>
            </Box>
            <Flex
              w="48px"
              h="48px"
              borderRadius="14px"
              bg="rgba(16, 185, 129, 0.2)"
              align="center"
              justify="center"
            >
              <HiOutlineGift size={24} color="#10B981" />
            </Flex>
          </Flex>

          <ActionButton
            w="100%"
            variant="primary"
            bg="#10B981"
            onClick={handleClaim}
            loading={isClaiming}
            disabled={parseFloat(stakingInfo.pendingRewards) <= 0}
          >
            <Flex align="center" gap="2">
              <HiOutlineGift size={18} />
              <Text>领取收益</Text>
            </Flex>
          </ActionButton>
        </MotionBox>

        {/* 收益统计 */}
        <SimpleGrid columns={2} gap="3">
          <StatCard
            label="累计收益"
            value={stakingInfo.totalRewards}
            unit="PFT"
            icon={<HiOutlineSparkles size={18} />}
            color="accent.orange"
            delay={0.1}
          />
          <StatCard
            label="每日收益"
            value={stakingInfo.dailyRewards}
            unit="PFT"
            icon={<HiOutlineCalendarDays size={18} />}
            color="accent.cyan"
            delay={0.15}
          />
          <StatCard
            label="年化收益率"
            value={stakingInfo.apr}
            unit="%"
            subValue="APR"
            icon={<HiOutlineArrowTrendingUp size={18} />}
            delay={0.2}
          />
          <StatCard
            label="收益周期"
            value="24"
            unit="小时"
            subValue="每日结算"
            icon={<HiOutlineClock size={18} />}
            delay={0.25}
          />
        </SimpleGrid>

        {/* 收益明细 */}
        <Box>
          <Flex justify="space-between" align="center" mb="3">
            <Text fontSize="sm" fontWeight="600" color="text.secondary">
              收益记录
            </Text>
            <Text fontSize="xs" color="text.muted">
              最近 30 天
            </Text>
          </Flex>

          <VStack gap="2" align="stretch">
            {mockRewardRecords.map((record, index) => (
              <RewardRecordItem key={record.id} record={record} delay={index * 0.05} />
            ))}
          </VStack>
        </Box>

        {/* 收益说明 */}
        <Box
          bg="bg.card"
          borderRadius="14px"
          p="4"
          border="1px solid"
          borderColor="border.default"
        >
          <Text fontSize="sm" fontWeight="600" color="text.secondary" mb="3">
            收益说明
          </Text>
          <VStack gap="2" align="stretch">
            <RuleItem text="质押收益：每日根据质押量和 APR 计算" />
            <RuleItem text="团队收益：根据直推和间接用户的质押量计算" />
            <RuleItem text="活动奖励：参与平台活动获得的额外奖励" />
            <RuleItem text="收益每日 UTC 0:00 结算，可随时领取" />
          </VStack>
        </Box>
      </VStack>
    </Box>
  )
}

interface RewardRecordItemProps {
  record: RewardRecord
  delay: number
}

function RewardRecordItem({ record, delay }: RewardRecordItemProps) {
  const typeConfig = {
    staking: {
      label: '质押收益',
      color: 'accent.green',
      icon: <HiOutlineSparkles size={16} />,
      bg: 'rgba(16, 185, 129, 0.15)',
    },
    team: {
      label: '团队收益',
      color: 'accent.cyan',
      icon: <HiOutlineGift size={16} />,
      bg: 'rgba(34, 211, 238, 0.15)',
    },
    bonus: {
      label: '活动奖励',
      color: 'accent.orange',
      icon: <HiOutlineGift size={16} />,
      bg: 'rgba(245, 158, 11, 0.15)',
    },
  }

  const config = typeConfig[record.type]

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
            w="36px"
            h="36px"
            borderRadius="10px"
            bg={config.bg}
            align="center"
            justify="center"
            color={config.color}
          >
            {config.icon}
          </Flex>
          <Box>
            <Text fontSize="sm" fontWeight="600" color="text.primary">
              {config.label}
            </Text>
            <Text fontSize="xs" color="text.muted">
              {record.date}
            </Text>
          </Box>
        </Flex>
        <Text fontSize="sm" fontWeight="600" color={config.color}>
          +{record.amount} PFT
        </Text>
      </Flex>
    </MotionBox>
  )
}

function RuleItem({ text }: { text: string }) {
  return (
    <Flex align="flex-start" gap="2">
      <Box
        w="4px"
        h="4px"
        borderRadius="full"
        bg="brand.primary"
        mt="2"
        flexShrink={0}
      />
      <Text fontSize="xs" color="text.muted" lineHeight="1.5">
        {text}
      </Text>
    </Flex>
  )
}
