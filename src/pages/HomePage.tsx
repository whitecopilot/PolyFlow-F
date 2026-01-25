// PayFi 首页 - 资产驾驶舱

import { Box, Flex, HStack, SimpleGrid, Text, VStack } from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { useEffect } from 'react'
import {
  HiOutlineArrowTrendingUp,
  HiOutlineBolt,
  HiOutlineGift,
  HiOutlineShieldCheck,
  HiOutlineUserPlus,
} from 'react-icons/hi2'
import { useNavigate } from 'react-router-dom'
import {
  GradientBorderCard,
  NFTBadge,
  PageHeader,
  PolyFlowLogo,
  PriceCompact,
  ProgressBar,
  StatCard,
} from '../components/common'
import { usePayFiStore } from '../stores/payfiStore'

const MotionBox = motion.create(Box)
const MotionFlex = motion.create(Flex)

export function HomePage() {
  const navigate = useNavigate()
  const {
    priceInfo,
    userAssets,
    earningsStats,
    systemStats,
    fetchAllData,
  } = usePayFiStore()

  useEffect(() => {
    fetchAllData()
  }, [fetchAllData])

  // 计算总资产价值
  const totalAssetValue = userAssets
    ? (userAssets.pidBalance * (priceInfo?.pidPrice || 0)) +
      (userAssets.picBalance * (priceInfo?.picPrice || 0)) +
      userAssets.totalNFTInvest
    : 0

  return (
    <Box>
      <PageHeader />

      <VStack gap="5" p="4" align="stretch">
        {/* 资产总览卡片 */}
        <GradientBorderCard glowIntensity="high">
          <MotionBox
            p="5"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* 标题行 */}
            <Flex justify="space-between" align="flex-start" mb="4">
              <Box>
                <HStack gap={2} mb="1">
                  <PolyFlowLogo size={16} colorMode="gradient" />
                  <Text fontSize="sm" color="whiteAlpha.600">
                    总资产价值
                  </Text>
                  {userAssets?.currentNFTLevel && (
                    <NFTBadge level={userAssets.currentNFTLevel} size="sm" />
                  )}
                </HStack>
                <MotionFlex
                  align="baseline"
                  gap="1"
                  initial={{ scale: 0.9 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.3, delay: 0.2 }}
                >
                  <Text fontSize="3xl" fontWeight="700" color="white">
                    ${totalAssetValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </Text>
                </MotionFlex>
              </Box>
            </Flex>

            {/* 价格指标 */}
            <HStack gap={4} mb="4" pb="4" borderBottom="1px solid" borderColor="whiteAlpha.100">
              <PriceCompact
                label="PID"
                price={priceInfo?.pidPrice || 0}
                change={priceInfo?.pidChange ? priceInfo.pidChange / (priceInfo.pidPrice - priceInfo.pidChange) : 0}
              />
              <PriceCompact
                label="PIC"
                price={priceInfo?.picPrice || 0}
                change={priceInfo?.picChange ? priceInfo.picChange / (priceInfo.picPrice - priceInfo.picChange) : 0}
              />
            </HStack>

            {/* 资产明细 - PID/PIC 可用与锁仓分开显示 */}
            <SimpleGrid columns={2} gap={3}>
              {/* PID 可用/锁仓 */}
              <Box bg="whiteAlpha.50" borderRadius="lg" p={2}>
                <Text fontSize="xs" color="whiteAlpha.500" mb={1}>PID 可用 / 锁仓</Text>
                <HStack gap={2}>
                  <Text fontSize="sm" fontWeight="600" color="white">
                    {userAssets?.pidBalance.toFixed(2) || '0.00'}
                  </Text>
                  <Text fontSize="xs" color="whiteAlpha.400">/</Text>
                  <Text fontSize="sm" fontWeight="600" color="whiteAlpha.600">
                    {userAssets?.pidTotalLocked.toFixed(2) || '0.00'}
                  </Text>
                </HStack>
              </Box>
              {/* PIC 可用/锁仓 */}
              <Box bg="whiteAlpha.50" borderRadius="lg" p={2}>
                <Text fontSize="xs" color="whiteAlpha.500" mb={1}>PIC 可用 / 锁仓</Text>
                <HStack gap={2}>
                  <Text fontSize="sm" fontWeight="600" color="white">
                    {userAssets?.picBalance.toFixed(2) || '0.00'}
                  </Text>
                  <Text fontSize="xs" color="whiteAlpha.400">/</Text>
                  <Text fontSize="sm" fontWeight="600" color="whiteAlpha.600">
                    0.00
                  </Text>
                </HStack>
              </Box>
            </SimpleGrid>
          </MotionBox>
        </GradientBorderCard>

        {/* 核心指标 */}
        <SimpleGrid columns={3} gap="3">
          <MotionBox
            bg="#17171C"
            borderRadius="xl"
            p="3"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <HStack gap={1} mb={1}>
              <HiOutlineBolt size={14} color="#292FE1" />
              <Text fontSize="xs" color="whiteAlpha.600">算力值</Text>
            </HStack>
            <Text fontSize="lg" fontWeight="bold" color="white">
              {userAssets?.totalPower.toLocaleString() || '0'}
            </Text>
            <HStack gap={1} mt={1}>
              <Text fontSize="2xs" color="whiteAlpha.400">
                NFT {userAssets?.powerFromNFT.toLocaleString() || '0'}
              </Text>
              <Text fontSize="2xs" color="whiteAlpha.300">+</Text>
              <Text fontSize="2xs" color="whiteAlpha.400">
                销毁 {userAssets?.powerFromBurn.toLocaleString() || '0'}
              </Text>
            </HStack>
          </MotionBox>

          <MotionBox
            bg="#17171C"
            borderRadius="xl"
            p="3"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            <HStack gap={1} mb={1}>
              <HiOutlineShieldCheck size={14} color="#D811F0" />
              <Text fontSize="xs" color="whiteAlpha.600">出局额度</Text>
            </HStack>
            <Text fontSize="lg" fontWeight="bold" color="white">
              ${userAssets?.totalExitLimit.toLocaleString() || '0'}
            </Text>
          </MotionBox>

          <MotionBox
            bg="#17171C"
            borderRadius="xl"
            p="3"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <HStack gap={1} mb={1}>
              <HiOutlineArrowTrendingUp size={14} color="#22C55E" />
              <Text fontSize="xs" color="whiteAlpha.600">日化率</Text>
            </HStack>
            <Text fontSize="lg" fontWeight="bold" color="#22C55E">
              {((systemStats?.dailyRate || 0) * 100).toFixed(2)}%
            </Text>
          </MotionBox>
        </SimpleGrid>

        {/* 今日收益卡片 */}
        <MotionBox
          bg="#17171C"
          borderRadius="xl"
          p="4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          <Flex justify="space-between" align="center" mb="3">
            <HStack gap={2}>
              <HiOutlineGift size={18} color="#D811F0" />
              <Text fontSize="sm" color="whiteAlpha.700">今日收益</Text>
            </HStack>
            <Text fontSize="xl" fontWeight="bold" color="#22C55E">
              +${earningsStats?.todayEarnings.toFixed(2) || '0.00'}
            </Text>
          </Flex>

          <ProgressBar
            value={userAssets?.earnedRewards || 0}
            max={userAssets?.totalExitLimit || 1}
            label="出局进度"
            colorScheme="gradient"
            height={6}
          />

          <Flex justify="space-between" mt="2">
            <Text fontSize="xs" color="whiteAlpha.500">
              已领取: ${userAssets?.earnedRewards.toLocaleString() || '0'}
            </Text>
            <Text fontSize="xs" color="whiteAlpha.500">
              剩余: ${userAssets?.remainingLimit.toLocaleString() || '0'}
            </Text>
          </Flex>
        </MotionBox>

        {/* 收益数据 */}
        <Box>
          <Text fontSize="sm" fontWeight="600" color="whiteAlpha.600" mb="3">
            收益统计
          </Text>
          <SimpleGrid columns={2} gap="3">
            <StatCard
              label="挖矿收益"
              value={`$${earningsStats?.totalStaticEarned.toLocaleString() || '0'}`}
              subValue="累计"
              icon={<HiOutlineBolt size={18} />}
              color="#292FE1"
              delay={0.1}
            />
            <StatCard
              label="邀请奖励"
              value={`$${earningsStats?.totalReferralEarned.toLocaleString() || '0'}`}
              subValue="累计"
              icon={<HiOutlineUserPlus size={18} />}
              color="#D811F0"
              delay={0.15}
            />
            <StatCard
              label="节点奖励"
              value={`$${earningsStats?.totalNodeEarned.toLocaleString() || '0'}`}
              subValue="累计"
              icon={<HiOutlineGift size={18} />}
              color="#22C55E"
              delay={0.2}
            />
            <StatCard
              label="空投奖励"
              value={`$${earningsStats?.totalGlobalEarned.toLocaleString() || '0'}`}
              subValue="累计"
              icon={<HiOutlineGift size={18} />}
              color="#EAB308"
              delay={0.25}
            />
          </SimpleGrid>
        </Box>

        {/* 邀请入口 */}
        <MotionBox
          bg="#17171C"
          borderRadius="xl"
          p="4"
          border="1px solid"
          borderColor="whiteAlpha.100"
          cursor="pointer"
          onClick={() => navigate('/invite')}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          whileTap={{ scale: 0.98 }}
        >
          <Flex justify="space-between" align="center">
            <Flex align="center" gap="3">
              <Flex
                w="44px"
                h="44px"
                borderRadius="12px"
                bg="rgba(216, 17, 240, 0.15)"
                align="center"
                justify="center"
              >
                <HiOutlineUserPlus size={22} color="#D811F0" />
              </Flex>
              <Box>
                <Text fontSize="sm" fontWeight="600" color="white">
                  邀请好友
                </Text>
              </Box>
            </Flex>
            <Box color="whiteAlpha.400">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </Box>
          </Flex>
        </MotionBox>

        {/* 底部间距 */}
        <Box h="20" />
      </VStack>
    </Box>
  )
}
