// NFT 页面 - 等级殿堂

import { Box, Flex, HStack, SimpleGrid, Text, VStack } from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import {
  HiOutlineArrowUp,
  HiOutlineBolt,
  HiOutlineCheck,
  HiOutlineCube,
  HiOutlineLockClosed,
  HiOutlinePlay,
  HiOutlineShieldCheck,
  HiOutlineSparkles,
  HiOutlineShoppingCart,
} from 'react-icons/hi2'
import { Sparkle, Trophy } from '@phosphor-icons/react'
import {
  ActionButton,
  GradientBorderCard,
  NFTBadge,
  PageHeader,
} from '../components/common'
import { NFT_LEVEL_CONFIGS, calculateUpgradeCost, getNFTConfig } from '../mocks/payfiConfig'
import { usePayFiStore } from '../stores/payfiStore'
import type { NFTLevel } from '../types/payfi'

const MotionBox = motion.create(Box)

export function NFTPage() {
  const {
    userAssets,
    priceInfo,
    purchaseNFT,
    upgradeNFT,
    stakeNFT,
    fetchUserAssets,
  } = usePayFiStore()

  const [selectedLevel, setSelectedLevel] = useState<NFTLevel>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [isStaking, setIsStaking] = useState(false)

  useEffect(() => {
    fetchUserAssets()
  }, [fetchUserAssets])

  const currentLevel = userAssets?.currentNFTLevel ?? null
  const currentConfig = getNFTConfig(currentLevel)
  const currentLevelIndex = currentLevel
    ? NFT_LEVEL_CONFIGS.findIndex(c => c.level === currentLevel)
    : -1

  // 处理购买/升级
  const handlePurchaseOrUpgrade = async () => {
    if (!selectedLevel || isProcessing) return

    setIsProcessing(true)
    try {
      if (!currentLevel) {
        // 首次购买
        await purchaseNFT(selectedLevel)
      } else {
        // 升级
        await upgradeNFT(selectedLevel)
      }
      setSelectedLevel(null)
    } finally {
      setIsProcessing(false)
    }
  }

  // 处理质押
  const handleStake = async () => {
    if (isStaking || !currentLevel || userAssets?.nftStaked) return

    setIsStaking(true)
    try {
      await stakeNFT()
    } finally {
      setIsStaking(false)
    }
  }

  // 格式化质押时间
  const formatStakeTime = (date: Date | null) => {
    if (!date) return '-'
    const d = new Date(date)
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  }

  // 计算质押天数
  const getStakeDays = (date: Date | null) => {
    if (!date) return 0
    const diff = new Date().getTime() - new Date(date).getTime()
    return Math.floor(diff / (1000 * 60 * 60 * 24))
  }

  // 获取选中等级的配置
  const selectedConfig = getNFTConfig(selectedLevel)
  const upgradeCost = selectedLevel ? calculateUpgradeCost(currentLevel, selectedLevel) : 0

  return (
    <Box minH="100vh" bg="black">
      <PageHeader title="NFT" />

      <VStack gap="5" p="4" align="stretch">
        {/* 当前等级横幅 */}
        <GradientBorderCard glowIntensity={currentLevel ? 'medium' : 'none'}>
          <MotionBox
            p="4"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <HStack justify="space-between" align="center">
              <VStack align="start" gap={1}>
                <HStack gap={1}>
                  <Sparkle size={14} weight="fill" color="#D811F0" />
                  <Text fontSize="sm" color="whiteAlpha.600">当前等级</Text>
                </HStack>
                {currentLevel ? (
                  <HStack gap={2}>
                    <NFTBadge level={currentLevel} size="lg" showName />
                  </HStack>
                ) : (
                  <Text fontSize="lg" fontWeight="bold" color="whiteAlpha.400">
                    未持有 NFT
                  </Text>
                )}
              </VStack>

              {currentConfig && (
                <VStack align="end" gap={0}>
                  <Text fontSize="xs" color="whiteAlpha.500">
                    算力系数 {currentConfig.coefficient}x
                  </Text>
                  <Text fontSize="xs" color="whiteAlpha.500">
                    矿池倍数 {currentConfig.nftExitMultiplier}x
                  </Text>
                </VStack>
              )}
            </HStack>
          </MotionBox>
        </GradientBorderCard>

        {/* 质押状态卡片 - 仅在持有 NFT 时显示 */}
        {currentLevel && (
          <MotionBox
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <GradientBorderCard
              glowIntensity={userAssets?.nftStaked ? 'medium' : 'none'}
            >
              <Box p="4">
                <HStack justify="space-between" align="start" mb="3">
                  <HStack gap={2}>
                    <Box
                      w="8"
                      h="8"
                      borderRadius="lg"
                      bg={userAssets?.nftStaked ? 'rgba(34, 197, 94, 0.2)' : 'rgba(251, 191, 36, 0.2)'}
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                    >
                      <HiOutlineCube
                        size={18}
                        color={userAssets?.nftStaked ? '#22C55E' : '#FBBF24'}
                      />
                    </Box>
                    <VStack align="start" gap={0}>
                      <Text fontSize="sm" fontWeight="600" color="white">
                        质押挖矿
                      </Text>
                      <Text fontSize="xs" color="whiteAlpha.500">
                        质押 NFT 开启挖矿收益
                      </Text>
                    </VStack>
                  </HStack>

                  <Box
                    px="2.5"
                    py="1"
                    borderRadius="full"
                    bg={userAssets?.nftStaked ? 'rgba(34, 197, 94, 0.2)' : 'rgba(251, 191, 36, 0.2)'}
                  >
                    <Text
                      fontSize="xs"
                      fontWeight="bold"
                      color={userAssets?.nftStaked ? '#22C55E' : '#FBBF24'}
                    >
                      {userAssets?.nftStaked ? '挖矿中' : '未质押'}
                    </Text>
                  </Box>
                </HStack>

                {/* 质押信息 */}
                {userAssets?.nftStaked ? (
                  <Box
                    bg="rgba(34, 197, 94, 0.08)"
                    borderRadius="lg"
                    p="3"
                  >
                    <SimpleGrid columns={2} gap={3}>
                      <VStack align="start" gap={0}>
                        <Text fontSize="xs" color="whiteAlpha.500">
                          质押时间
                        </Text>
                        <Text fontSize="sm" fontWeight="600" color="white">
                          {formatStakeTime(userAssets.nftStakeTime)}
                        </Text>
                      </VStack>
                      <VStack align="start" gap={0}>
                        <Text fontSize="xs" color="whiteAlpha.500">
                          已质押天数
                        </Text>
                        <Text fontSize="sm" fontWeight="600" color="#22C55E">
                          {getStakeDays(userAssets.nftStakeTime)} 天
                        </Text>
                      </VStack>
                    </SimpleGrid>
                  </Box>
                ) : (
                  <>
                    <Box
                      bg="rgba(251, 191, 36, 0.08)"
                      borderRadius="lg"
                      p="3"
                      mb="3"
                    >
                      <VStack gap={1.5} align="start">
                        <HStack gap={1.5}>
                          <Box w="1.5" h="1.5" borderRadius="full" bg="#FBBF24" />
                          <Text fontSize="xs" color="whiteAlpha.700">
                            质押后才能获得<Text as="span" color="#FBBF24" fontWeight="600">PIC挖矿收益</Text>
                          </Text>
                        </HStack>
                        <HStack gap={1.5}>
                          <Box w="1.5" h="1.5" borderRadius="full" bg="#FBBF24" />
                          <Text fontSize="xs" color="whiteAlpha.700">
                            质押操作需要链上确认
                          </Text>
                        </HStack>
                      </VStack>
                    </Box>

                    {/* 质押按钮 - 仅在未质押时显示 */}
                    <ActionButton
                      variant="primary"
                      w="full"
                      size="md"
                      onClick={handleStake}
                      disabled={isStaking}
                    >
                      <HStack gap={2} justify="center">
                        {isStaking ? (
                          <Text>链上确认中...</Text>
                        ) : (
                          <>
                            <HiOutlinePlay size={16} />
                            <Text>立即质押</Text>
                          </>
                        )}
                      </HStack>
                    </ActionButton>
                  </>
                )}
              </Box>
            </GradientBorderCard>
          </MotionBox>
        )}

        {/* 等级进度条 */}
        <Box px="2">
          <HStack justify="space-between" position="relative">
            {/* 背景线 - 固定在圆圈中心位置 */}
            <Box
              position="absolute"
              top="20px"
              left="8%"
              right="8%"
              h="2px"
              bg="whiteAlpha.200"
            />

            {/* 进度线 */}
            <MotionBox
              position="absolute"
              top="20px"
              left="8%"
              h="2px"
              bg="linear-gradient(90deg, #292FE1 0%, #D811F0 100%)"
              initial={{ width: 0 }}
              animate={{
                width: currentLevelIndex >= 0
                  ? `${(currentLevelIndex / (NFT_LEVEL_CONFIGS.length - 1)) * 84}%`
                  : '0%',
              }}
              transition={{ duration: 0.8 }}
            />

            {/* 等级节点 */}
            {NFT_LEVEL_CONFIGS.map((config, index) => {
              const isOwned = currentLevelIndex >= index
              const isCurrent = currentLevel === config.level
              const isSelected = selectedLevel === config.level

              return (
                <VStack
                  key={config.level}
                  gap={1}
                  zIndex={1}
                  cursor="pointer"
                  onClick={() => {
                    if (index > currentLevelIndex) {
                      setSelectedLevel(config.level)
                    }
                  }}
                >
                  <MotionBox
                    w={isCurrent || isSelected ? 10 : 8}
                    h={isCurrent || isSelected ? 10 : 8}
                    borderRadius="full"
                    bg={isOwned ? '#292FE1' : isSelected ? '#D811F0' : 'whiteAlpha.200'}
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    borderWidth={isSelected ? 2 : 0}
                    borderColor="#D811F0"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {isOwned ? (
                      <HiOutlineCheck size={16} color="white" />
                    ) : (
                      <Text fontSize="xs" color="white" fontWeight="bold">
                        {config.level}
                      </Text>
                    )}
                  </MotionBox>
                  <Text
                    fontSize="10px"
                    color={isCurrent ? 'white' : isSelected ? '#D811F0' : 'whiteAlpha.500'}
                    fontWeight={isCurrent || isSelected ? 'bold' : 'normal'}
                  >
                    {config.level}
                  </Text>
                </VStack>
              )
            })}
          </HStack>
        </Box>

        {/* 升级/购买卡片 */}
        {selectedConfig && (
          <MotionBox
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <GradientBorderCard glowIntensity="high">
              <Box p="5">
                <HStack justify="space-between" mb="4">
                  <VStack align="start" gap={1}>
                    <HStack gap={2}>
                      <HStack gap={1}>
                        <Trophy size={20} weight="fill" color="#ECC94B" />
                        <Text fontSize="xl" fontWeight="bold" color="white">
                          {selectedConfig.level}
                        </Text>
                      </HStack>
                      <Text fontSize="lg" color="whiteAlpha.700">
                        {selectedConfig.name}
                      </Text>
                    </HStack>
                    {currentLevel && (
                      <HStack gap={1}>
                        <HiOutlineArrowUp size={14} color="#22C55E" />
                        <Text fontSize="sm" color="#22C55E">
                          从 {currentLevel} 升级
                        </Text>
                      </HStack>
                    )}
                  </VStack>
                </HStack>

                {/* 属性网格 */}
                <SimpleGrid columns={2} gap={3} mb="4">
                  <Box bg="whiteAlpha.50" borderRadius="lg" p="3">
                    <HStack gap={1} mb={1}>
                      <Text fontSize="xs" color="whiteAlpha.500">价格</Text>
                    </HStack>
                    <Text fontSize="lg" fontWeight="bold" color="white">
                      ${selectedConfig.price.toLocaleString()}
                    </Text>
                  </Box>

                  <Box bg="whiteAlpha.50" borderRadius="lg" p="3">
                    <HStack gap={1} mb={1}>
                      <HiOutlineBolt size={12} color="#292FE1" />
                      <Text fontSize="xs" color="whiteAlpha.500">基础算力</Text>
                    </HStack>
                    <Text fontSize="lg" fontWeight="bold" color="white">
                      {selectedConfig.power.toLocaleString()}
                    </Text>
                  </Box>

                  <Box bg="whiteAlpha.50" borderRadius="lg" p="3">
                    <HStack gap={1} mb={1}>
                      <HiOutlineSparkles size={12} color="#D811F0" />
                      <Text fontSize="xs" color="whiteAlpha.500">算力系数</Text>
                    </HStack>
                    <Text fontSize="lg" fontWeight="bold" color="white">
                      {selectedConfig.coefficient}x
                    </Text>
                  </Box>

                  <Box bg="whiteAlpha.50" borderRadius="lg" p="3">
                    <HStack gap={1} mb={1}>
                      <HiOutlineShieldCheck size={12} color="#22C55E" />
                      <Text fontSize="xs" color="whiteAlpha.500">矿池倍数</Text>
                    </HStack>
                    <Text fontSize="lg" fontWeight="bold" color="white">
                      NFT {selectedConfig.nftExitMultiplier}x
                    </Text>
                    <Text fontSize="xs" color="whiteAlpha.500">
                      销毁PIC {selectedConfig.burnExitMultiplier}x
                    </Text>
                  </Box>
                </SimpleGrid>

                {/* 获得 PID 预估 */}
                {priceInfo && (
                  <Box
                    bg="rgba(41, 47, 225, 0.1)"
                    borderRadius="lg"
                    p="3"
                    mb="4"
                  >
                    <Text fontSize="xs" color="whiteAlpha.600" mb="1">
                      预计获得 PID
                    </Text>
                    <Text fontSize="xl" fontWeight="bold" color="#292FE1">
                      {(upgradeCost / priceInfo.pidPrice).toFixed(2)} PID
                    </Text>
                    <Text fontSize="xs" color="whiteAlpha.500">
                      当前 PID 价格: ${priceInfo.pidPrice.toFixed(4)}
                    </Text>
                  </Box>
                )}

                {/* 购买/升级按钮 */}
                <ActionButton
                  variant="primary"
                  w="full"
                  size="lg"
                  onClick={handlePurchaseOrUpgrade}
                  disabled={isProcessing}
                >
                  <HStack gap={2} justify="center">
                    {isProcessing ? (
                      <Text>处理中...</Text>
                    ) : currentLevel ? (
                      <Text>升级到 {selectedConfig.level}</Text>
                    ) : (
                      <>
                        <HiOutlineShoppingCart size={18} />
                        <Text>购买 {selectedConfig.level}</Text>
                      </>
                    )}
                  </HStack>
                </ActionButton>
              </Box>
            </GradientBorderCard>
          </MotionBox>
        )}

        {/* 等级列表 */}
        <Box>
          <Text fontSize="sm" fontWeight="600" color="whiteAlpha.600" mb="3">
            全部等级
          </Text>
          <VStack gap={2}>
            {NFT_LEVEL_CONFIGS.map((config, index) => {
              const isOwned = currentLevelIndex >= index
              const isCurrent = currentLevel === config.level
              const isLocked = index > currentLevelIndex + 1 && currentLevelIndex >= 0

              return (
                <MotionBox
                  key={config.level}
                  w="full"
                  bg={isCurrent ? 'rgba(41, 47, 225, 0.15)' : '#17171C'}
                  borderRadius="xl"
                  p="4"
                  borderWidth={isCurrent ? 1 : 0}
                  borderColor="#292FE1"
                  cursor={isLocked ? 'not-allowed' : 'pointer'}
                  opacity={isLocked ? 0.5 : 1}
                  onClick={() => {
                    if (!isLocked && index > currentLevelIndex) {
                      setSelectedLevel(config.level)
                    }
                  }}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: isLocked ? 0.5 : 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={!isLocked ? { scale: 1.02 } : undefined}
                  whileTap={!isLocked ? { scale: 0.98 } : undefined}
                >
                  <Flex justify="space-between" align="center">
                    <HStack gap={3}>
                      <NFTBadge level={config.level} size="md" />
                      <VStack align="start" gap={0}>
                        <Text fontSize="sm" fontWeight="600" color="white">
                          {config.name}
                        </Text>
                        <Text fontSize="xs" color="whiteAlpha.500">
                          ${config.price.toLocaleString()} · 算力 {config.power}
                        </Text>
                      </VStack>
                    </HStack>

                    <HStack gap={2}>
                      {isCurrent && (
                        <Box
                          px="2"
                          py="0.5"
                          bg="#292FE1"
                          borderRadius="full"
                        >
                          <Text fontSize="xs" color="white" fontWeight="bold">
                            当前
                          </Text>
                        </Box>
                      )}
                      {isOwned && !isCurrent && (
                        <HiOutlineCheck size={20} color="#22C55E" />
                      )}
                      {isLocked && (
                        <HiOutlineLockClosed size={20} color="#71717A" />
                      )}
                    </HStack>
                  </Flex>
                </MotionBox>
              )
            })}
          </VStack>
        </Box>

        {/* 底部间距 */}
        <Box h="24" />
      </VStack>
    </Box>
  )
}
