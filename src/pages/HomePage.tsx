// PayFi 首页 - 资产驾驶舱

import { Box, Image as ChakraImage, Flex, HStack, Link, SimpleGrid, Text, VStack } from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import {
  HiOutlineArrowTrendingUp,
  HiOutlineBolt,
  HiOutlineGift,
  HiOutlineShieldCheck,
  HiOutlineUserPlus,
} from 'react-icons/hi2'
import { useNavigate } from 'react-router-dom'
import DcIcon from '../assets/svg/dc.svg'
import MediumIcon from '../assets/svg/medium.svg'
import MirrorIcon from '../assets/svg/mirror.svg'
import TgIcon from '../assets/svg/tg.svg'
import XIcon from '../assets/svg/x.svg'
import {
  GradientBorderCard,
  NFTBadge,
  PageHeader,
  PolyFlowLogo,
  PriceCompact,
  ProgressBar,
  StatCard,
} from '../components/common'
// 投资者图片
import Investor10k from '../assets/png/10k-3x.png'
import InvestorCeic from '../assets/png/ceic-3x.png'
import InvestorHash from '../assets/png/hash-3x.png'
import InvestorKucoin from '../assets/png/kucoin-3x.png'
import InvestorMeter from '../assets/png/meter-3x.png'
import InvestorSolana from '../assets/png/solana-3x.png'
import InvestorStellar from '../assets/png/Stellar-3x.png'
import InvestorWd from '../assets/png/wd-3x.png'
import InvestorZc from '../assets/png/zc-3x.png'
import { usePayFiStore } from '../stores/payfiStore'

const MotionBox = motion.create(Box)
const MotionFlex = motion.create(Flex)

export function HomePage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const {
    priceInfo,
    userAssets,
    earningsStats,
    systemStats,
    fetchHomeData,
  } = usePayFiStore()

  useEffect(() => {
    fetchHomeData()
  }, [fetchHomeData])

  // 使用后端计算的总资产估值，如果没有则本地计算
  const totalAssetValue = userAssets?.totalAssetValueUSDT ||
    (userAssets
      ? (userAssets.pidBalance + userAssets.pidTotalLocked) * (priceInfo?.pidPrice || 0) +
        userAssets.picBalance * (priceInfo?.picPrice || 0) +
        userAssets.totalNFTInvest
      : 0)

  return (
    <Box>
      <PageHeader />

      <VStack gap="5" p="4" align="stretch">
        {/* 资产总览卡片 */}
        <GradientBorderCard glowIntensity="high" colorScheme="purple">
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
                  <PolyFlowLogo size={28} colorMode="gradient" />
                  <Text fontSize="sm" color="whiteAlpha.600">
                    {t('home.total_asset_value')}
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
                // change={priceInfo?.pidChange ? priceInfo.pidChange / (priceInfo.pidPrice - priceInfo.pidChange) : 0}
              />
              <PriceCompact
                label="PIC"
                price={priceInfo?.picPrice || 0}
                // change={priceInfo?.picChange ? priceInfo.picChange / (priceInfo.picPrice - priceInfo.picChange) : 0}
              />
            </HStack>

            {/* 资产明细 - PID/PIC 可用与锁仓分开显示 */}
            <SimpleGrid columns={2} gap={3}>
              {/* PID 可用/锁仓 */}
              <Box bg="whiteAlpha.50" borderRadius="lg" p={2}>
                <Text fontSize="xs" color="whiteAlpha.500" mb={1}>{t('home.pid_available_locked')}</Text>
                <HStack gap={2}>
                  <Text fontSize="sm" fontWeight="600" color="white">
                    {userAssets?.pidBalance?.toFixed(2) ?? '0.00'}
                  </Text>
                  <Text fontSize="xs" color="whiteAlpha.400">/</Text>
                  <Text fontSize="sm" fontWeight="600" color="whiteAlpha.600">
                    {userAssets?.pidTotalLocked?.toFixed(2) ?? '0.00'}
                  </Text>
                </HStack>
              </Box>
              {/* PIC 可用/已释放 */}
              <Box bg="whiteAlpha.50" borderRadius="lg" p={2}>
                <Text fontSize="xs" color="whiteAlpha.500" mb={1}>{t('home.pic_available_locked')}</Text>
                <HStack gap={2}>
                  <Text fontSize="sm" fontWeight="600" color="white">
                    {userAssets?.picBalance?.toFixed(2) ?? '0.00'}
                  </Text>
                  <Text fontSize="xs" color="whiteAlpha.400">/</Text>
                  <Text fontSize="sm" fontWeight="600" color="whiteAlpha.600">
                    {userAssets?.picReleasedBalance?.toFixed(2) ?? '0.00'}
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
              <HiOutlineBolt size={14} color="#8A8A90" />
              <Text fontSize="xs" color="whiteAlpha.600">{t('home.power_value')}</Text>
            </HStack>
            <Text fontSize="lg" fontWeight="bold" color="white">
              {userAssets?.totalPower?.toLocaleString() ?? '0'}
            </Text>
            <HStack gap={1} mt={1}>
              <Text fontSize="2xs" color="whiteAlpha.400">
                NFT {userAssets?.powerFromNFT?.toLocaleString() ?? '0'}
              </Text>
              <Text fontSize="2xs" color="whiteAlpha.300">+</Text>
              <Text fontSize="2xs" color="whiteAlpha.400">
                {t('home.cumulative')} {userAssets?.powerFromBurn?.toLocaleString() ?? '0'}
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
              <HiOutlineShieldCheck size={14} color="#8A8A90" />
              <Text fontSize="xs" color="whiteAlpha.600">{t('home.pool_amount')}</Text>
            </HStack>
            <Text fontSize="lg" fontWeight="bold" color="white">
              ${userAssets?.totalExitLimit?.toLocaleString() ?? '0'}
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
              <HiOutlineArrowTrendingUp size={14} color="#8A8A90" />
              <Text fontSize="xs" color="whiteAlpha.600">{t('home.output_rate')}</Text>
            </HStack>
            <Text fontSize="lg" fontWeight="bold" color="white">
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
              <HiOutlineGift size={18} color="#8A8A90" />
              <Text fontSize="sm" color="whiteAlpha.700">{t('home.today_earnings')}</Text>
            </HStack>
            <Text fontSize="xl" fontWeight="bold" color="white">
              +${earningsStats?.todayEarnings?.toFixed(2) ?? '0.00'}
            </Text>
          </Flex>

          <ProgressBar
            value={userAssets?.earnedRewards || 0}
            max={userAssets?.totalExitLimit || 1}
            label={t('home.pool_progress')}
            colorScheme="gradient"
            height={6}
          />

          <Flex justify="space-between" mt="2">
            <Text fontSize="xs" color="whiteAlpha.500">
              {t('home.claimed')}: ${userAssets?.earnedRewards?.toLocaleString() ?? '0'}
            </Text>
            <Text fontSize="xs" color="whiteAlpha.500">
              {t('home.remaining')}: ${userAssets?.remainingLimit?.toLocaleString() ?? '0'}
            </Text>
          </Flex>
        </MotionBox>

        {/* 收益数据 */}
        <Box>
          <Text fontSize="sm" fontWeight="600" color="whiteAlpha.600" mb="3">
            {t('home.earnings_stats')}
          </Text>
          <SimpleGrid columns={2} gap="3">
            <StatCard
              label={t('home.mining_rewards')}
              value={`$${earningsStats?.totalStaticEarned?.toLocaleString() ?? '0'}`}
              subValue={t('home.cumulative')}
              icon={<HiOutlineBolt size={18} />}
              color="#8A8A90"
              delay={0.1}
            />
            <StatCard
              label={t('home.invitation_rewards')}
              value={`$${earningsStats?.totalReferralEarned?.toLocaleString() ?? '0'}`}
              subValue={t('home.cumulative')}
              icon={<HiOutlineUserPlus size={18} />}
              color="#8A8A90"
              delay={0.15}
            />
            <StatCard
              label={t('home.node_rewards')}
              value={`$${earningsStats?.totalNodeEarned?.toLocaleString() ?? '0'}`}
              subValue={t('home.cumulative')}
              icon={<HiOutlineGift size={18} />}
              color="#8A8A90"
              delay={0.2}
            />
            <StatCard
              label={t('home.airdrop_rewards')}
              value={`$${earningsStats?.totalGlobalEarned?.toLocaleString() ?? '0'}`}
              subValue={t('home.cumulative')}
              icon={<HiOutlineGift size={18} />}
              color="#8A8A90"
              delay={0.25}
            />
          </SimpleGrid>
        </Box>

        {/* 邀请入口 - 未激活用户禁用 */}
        <MotionBox
          bg="#17171C"
          borderRadius="xl"
          p="4"
          border="1px solid"
          borderColor="whiteAlpha.100"
          cursor={userAssets?.is_active ? 'pointer' : 'not-allowed'}
          opacity={userAssets?.is_active ? 1 : 0.5}
          onClick={() => userAssets?.is_active && navigate('/invite')}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: userAssets?.is_active ? 1 : 0.5, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          whileTap={userAssets?.is_active ? { scale: 0.98 } : undefined}
        >
          <Flex justify="space-between" align="center">
            <Flex align="center" gap="3">
              <Flex
                w="44px"
                h="44px"
                borderRadius="12px"
                bg={userAssets?.is_active ? 'rgba(255, 255, 255, 0.1)' : 'rgba(100, 100, 100, 0.15)'}
                align="center"
                justify="center"
              >
                <HiOutlineUserPlus size={22} color={userAssets?.is_active ? '#FFFFFF' : '#666'} />
              </Flex>
              <Box>
                <Text fontSize="sm" fontWeight="600" color={userAssets?.is_active ? 'white' : 'whiteAlpha.400'}>
                  {t('home.invite_friends')}
                </Text>
                {!userAssets?.is_active && (
                  <Text fontSize="xs" color="whiteAlpha.400">
                    {t('home.invite_disabled_hint')}
                  </Text>
                )}
              </Box>
            </Flex>
            <Box color="whiteAlpha.400">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </Box>
          </Flex>
        </MotionBox>

        {/* 帮助区块 */}
        <MotionBox
          mt="4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.35 }}
        >
          <VStack gap="3" align="center">
            <Text fontSize="md" fontWeight="600" color="white">
              {t('home.help_title')}
            </Text>
            <Text fontSize="sm" color="whiteAlpha.600">
              {t('home.help_subtitle')}
            </Text>
            <HStack gap="6" mt="2">
              <Link href="https://mirror.xyz/polyflow.eth" target="_blank">
                <ChakraImage src={MirrorIcon} w="28px" h="28px" opacity={0.7} _hover={{ opacity: 1 }} />
              </Link>
              <Link href="https://x.com/Polyflow_PayFi" target="_blank">
                <ChakraImage src={XIcon} w="28px" h="28px" opacity={0.7} _hover={{ opacity: 1 }} />
              </Link>
              <Link href="https://polyflow.medium.com/" target="_blank">
                <ChakraImage src={MediumIcon} w="28px" h="28px" opacity={0.7} _hover={{ opacity: 1 }} />
              </Link>
              <Link href="https://t.me/polyflow_community" target="_blank">
                <ChakraImage src={TgIcon} w="28px" h="28px" opacity={0.7} _hover={{ opacity: 1 }} />
              </Link>
              <Link href="https://discord.gg/455XEzqU3s" target="_blank">
                <ChakraImage src={DcIcon} w="28px" h="28px" opacity={0.7} _hover={{ opacity: 1 }} />
              </Link>
            </HStack>
          </VStack>
        </MotionBox>

        {/* 支持者 & 投资者 - 9宫格 */}
        <MotionBox
          mt="6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4 }}
        >
          <Text fontSize="md" fontWeight="600" color="white" mb="4" textAlign="center">
            {t('home.backers')}
          </Text>
          <SimpleGrid columns={3} gap="2">
            {[
              { src: InvestorWd, h: '22px' },
              { src: InvestorHash, h: '20px' },
              { src: Investor10k, h: '18px' },
              { src: InvestorCeic, h: '18px' },
              { src: InvestorStellar, h: '18px' },
              { src: InvestorKucoin, h: '18px' },
              { src: InvestorMeter, h: '18px' },
              { src: InvestorZc, h: '18px' },
              { src: InvestorSolana, h: '20px' },
            ].map((investor, index) => (
              <Box
                key={index}
                bg="#1A1A1F"
                borderRadius="lg"
                border="1px solid"
                borderColor="whiteAlpha.100"
                p="3"
                display="flex"
                alignItems="center"
                justifyContent="center"
                minH="50px"
              >
                <ChakraImage src={investor.src} h={investor.h} objectFit="contain" />
              </Box>
            ))}
          </SimpleGrid>
        </MotionBox>

        {/* 合作伙伴 */}
        <MotionBox
          mt="6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.45 }}
        >
          <VStack gap="3" align="center">
            <Text fontSize="md" fontWeight="600" color="white">
              {t('home.partners')}
            </Text>
            <ChakraImage
              src="https://static.polyflow.global/partners-mobile.png"
              w="100%"
            />
          </VStack>
        </MotionBox>

        {/* 底部间距 */}
        <Box h="20" />
      </VStack>
    </Box>
  )
}
