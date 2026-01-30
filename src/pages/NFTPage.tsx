// NFT 页面 - 等级殿堂

import { Box, Flex, HStack, SimpleGrid, Spinner, Text, VStack } from '@chakra-ui/react'
import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import {
  HiOutlineArrowUp,
  HiOutlineBolt,
  HiOutlineCheck,
  HiOutlineCube,
  HiOutlineExclamationCircle,
  HiOutlinePlay,
  HiOutlineQueueList,
  HiOutlineShieldCheck,
  HiOutlineSparkles,
  HiOutlineShoppingCart,
  HiOutlineXMark,
} from 'react-icons/hi2'
import { useNavigate } from 'react-router-dom'
import { Sparkle, Trophy, CheckCircle } from '@phosphor-icons/react'
import { useTranslation } from 'react-i18next'
import {
  ActionButton,
  GradientBorderCard,
  NFTBadge,
  PageHeader,
} from '../components/common'
import { usePayFiStore } from '../stores/payfiStore'
import { useNFTPurchase, type PurchaseStep } from '../hooks/useNFTPurchase'
import { useNFTStake, type StakeStep } from '../hooks/useNFTStake'
import type { NFTLevel } from '../types/payfi'
import type { UserNFTItem } from '../api/types'

const MotionBox = motion.create(Box)

// 购买进度蒙版组件
interface PurchaseOverlayProps {
  step: PurchaseStep
  statusText: string
  onClose?: () => void
}

function PurchaseOverlay({ step, statusText, onClose }: PurchaseOverlayProps) {
  const { t } = useTranslation()

  // 计算当前进度（1-5）
  const getProgress = () => {
    switch (step) {
      case 'creating': return 1
      case 'signing': return 2
      case 'submitting': return 3
      case 'verifying':
      case 'minting': return 4
      case 'success': return 5
      case 'error': return 0
      default: return 0
    }
  }

  const progress = getProgress()
  const isSuccess = step === 'success'
  const isError = step === 'error'

  return (
    <MotionBox
      position="fixed"
      inset={0}
      bg="blackAlpha.800"
      zIndex={1000}
      display="flex"
      alignItems="center"
      justifyContent="center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <VStack
        gap={6}
        p={8}
        bg="rgba(23, 23, 28, 0.95)"
        borderRadius="2xl"
        borderWidth={1}
        borderColor="whiteAlpha.100"
        maxW="320px"
        w="90%"
      >
        {/* 状态图标 */}
        {isSuccess ? (
          <MotionBox
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', damping: 10 }}
          >
            <CheckCircle size={64} weight="fill" color="#22C55E" />
          </MotionBox>
        ) : isError ? (
          <Box
            w={16}
            h={16}
            borderRadius="full"
            bg="rgba(239, 68, 68, 0.2)"
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            <HiOutlineXMark size={32} color="#EF4444" />
          </Box>
        ) : (
          <Spinner
            color="#8A8A90"
            w={16}
            h={16}
            borderWidth="4px"
          />
        )}

        {/* 状态文本 */}
        <VStack gap={2}>
          <Text
            fontSize="lg"
            fontWeight="bold"
            color={isError ? '#EF4444' : isSuccess ? '#22C55E' : 'white'}
            textAlign="center"
          >
            {statusText}
          </Text>

          {/* 进度提示 */}
          {!isSuccess && !isError && (
            <Text fontSize="sm" color="whiteAlpha.600">
              {t('mint.step')} {progress}/5
            </Text>
          )}
        </VStack>

        {/* 进度指示器 */}
        {!isSuccess && !isError && (
          <HStack gap={2}>
            {[1, 2, 3, 4, 5].map((i) => (
              <Box
                key={i}
                w={2}
                h={2}
                borderRadius="full"
                bg={i <= progress ? '#6A6A70' : 'whiteAlpha.200'}
                transition="background-color 0.3s"
              />
            ))}
          </HStack>
        )}

        {/* 钱包确认提示 */}
        {step === 'signing' && (
          <Text fontSize="xs" color="whiteAlpha.500" textAlign="center">
            {t('mint.wallet_confirm_hint')}
          </Text>
        )}

        {/* 关闭按钮 - 仅在成功或错误时显示 */}
        {(isSuccess || isError) && onClose && (
          <ActionButton
            variant={isSuccess ? 'primary' : 'secondary'}
            size="md"
            onClick={onClose}
            w="full"
            mt={2}
          >
            {t('common.close')}
          </ActionButton>
        )}
      </VStack>
    </MotionBox>
  )
}

// 质押进度蒙版组件
interface StakeOverlayProps {
  step: StakeStep
  statusText: string
  onClose?: () => void
}

function StakeOverlay({ step, statusText, onClose }: StakeOverlayProps) {
  const { t } = useTranslation()

  // 计算当前进度（1-4）
  const getProgress = () => {
    switch (step) {
      case 'preparing': return 1
      case 'signing': return 2
      case 'confirming': return 3
      case 'submitting': return 4
      case 'success': return 4
      case 'error': return 0
      default: return 0
    }
  }

  const progress = getProgress()
  const isSuccess = step === 'success'
  const isError = step === 'error'

  return (
    <MotionBox
      position="fixed"
      inset={0}
      bg="blackAlpha.800"
      zIndex={1000}
      display="flex"
      alignItems="center"
      justifyContent="center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <VStack
        gap={6}
        p={8}
        bg="rgba(23, 23, 28, 0.95)"
        borderRadius="2xl"
        borderWidth={1}
        borderColor="whiteAlpha.100"
        maxW="320px"
        w="90%"
      >
        {/* 状态图标 */}
        {isSuccess ? (
          <MotionBox
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', damping: 10 }}
          >
            <CheckCircle size={64} weight="fill" color="#22C55E" />
          </MotionBox>
        ) : isError ? (
          <Box
            w={16}
            h={16}
            borderRadius="full"
            bg="rgba(239, 68, 68, 0.2)"
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            <HiOutlineXMark size={32} color="#EF4444" />
          </Box>
        ) : (
          <Spinner
            color="#8A8A90"
            w={16}
            h={16}
            borderWidth="4px"
          />
        )}

        {/* 状态文本 */}
        <VStack gap={2}>
          <Text
            fontSize="lg"
            fontWeight="bold"
            color={isError ? '#EF4444' : isSuccess ? '#22C55E' : 'white'}
            textAlign="center"
          >
            {statusText}
          </Text>

          {/* 进度提示 */}
          {!isSuccess && !isError && (
            <Text fontSize="sm" color="whiteAlpha.600">
              {t('mint.step')} {progress}/4
            </Text>
          )}
        </VStack>

        {/* 进度指示器 */}
        {!isSuccess && !isError && (
          <HStack gap={2}>
            {[1, 2, 3, 4].map((i) => (
              <Box
                key={i}
                w={2}
                h={2}
                borderRadius="full"
                bg={i <= progress ? '#6A6A70' : 'whiteAlpha.200'}
                transition="background-color 0.3s"
              />
            ))}
          </HStack>
        )}

        {/* 钱包确认提示 */}
        {step === 'signing' && (
          <Text fontSize="xs" color="whiteAlpha.500" textAlign="center">
            {t('mint.wallet_confirm_hint')}
          </Text>
        )}

        {/* 关闭按钮 - 仅在成功或错误时显示 */}
        {(isSuccess || isError) && onClose && (
          <ActionButton
            variant={isSuccess ? 'primary' : 'secondary'}
            size="md"
            onClick={onClose}
            w="full"
            mt={2}
          >
            {t('common.close')}
          </ActionButton>
        )}
      </VStack>
    </MotionBox>
  )
}

// NFT 选择器蒙版组件
interface NFTSelectorOverlayProps {
  nfts: UserNFTItem[]
  filterLevel?: string | null
  onSelect: (nft: UserNFTItem) => void
  onClose: () => void
}

function NFTSelectorOverlay({ nfts, filterLevel, onSelect, onClose }: NFTSelectorOverlayProps) {
  const { t } = useTranslation()

  return (
    <MotionBox
      position="fixed"
      inset={0}
      bg="blackAlpha.800"
      zIndex={1000}
      display="flex"
      alignItems="center"
      justifyContent="center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <VStack
        gap={4}
        p={6}
        bg="rgba(23, 23, 28, 0.95)"
        borderRadius="2xl"
        borderWidth={1}
        borderColor="whiteAlpha.100"
        maxW="340px"
        w="90%"
        maxH="70vh"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 标题 */}
        <HStack w="full" justify="space-between" align="center">
          <HStack gap={2}>
            <Text fontSize="lg" fontWeight="bold" color="white">
              {t('nft.select_nft_to_stake')}
            </Text>
            {filterLevel && (
              <Box px={2} py={0.5} bg="rgba(138, 138, 144, 0.2)" borderRadius="full">
                <Text fontSize="xs" color="#8A8A90" fontWeight="bold">
                  {filterLevel}
                </Text>
              </Box>
            )}
          </HStack>
          <Box
            as="button"
            p={1}
            borderRadius="md"
            _hover={{ bg: 'whiteAlpha.100' }}
            onClick={onClose}
          >
            <HiOutlineXMark size={20} color="white" />
          </Box>
        </HStack>

        {/* 提示 */}
        <Text fontSize="sm" color="whiteAlpha.600" w="full">
          {t('nft.select_nft_hint')}
        </Text>

        {/* NFT 列表 */}
        <VStack
          w="full"
          gap={2}
          maxH="45vh"
          overflowY="auto"
          css={{
            '&::-webkit-scrollbar': { width: '4px' },
            '&::-webkit-scrollbar-track': { background: 'transparent' },
            '&::-webkit-scrollbar-thumb': { background: 'rgba(255,255,255,0.2)', borderRadius: '2px' },
          }}
        >
          {nfts.map((nft) => (
            <Box
              key={nft.id}
              w="full"
              p={3}
              bg="whiteAlpha.50"
              borderRadius="lg"
              cursor="pointer"
              _hover={{ bg: 'whiteAlpha.100' }}
              onClick={() => onSelect(nft)}
            >
              <HStack justify="space-between" align="center">
                <HStack gap={3}>
                  <NFTBadge level={nft.nftLevel as NFTLevel} size="sm" />
                  <VStack align="start" gap={0}>
                    <Text fontSize="sm" fontWeight="600" color="white">
                      Token #{nft.tokenId}
                    </Text>
                    <Text fontSize="xs" color="whiteAlpha.500">
                      {t('nft.power')} {nft.power}
                    </Text>
                  </VStack>
                </HStack>
                <Box
                  px={2}
                  py={0.5}
                  bg="rgba(138, 138, 144, 0.2)"
                  borderRadius="full"
                >
                  <Text fontSize="xs" color="#8A8A90" fontWeight="bold">
                    {nft.nftLevel}
                  </Text>
                </Box>
              </HStack>
            </Box>
          ))}
        </VStack>

        {/* 取消按钮 */}
        <ActionButton
          variant="secondary"
          size="md"
          onClick={onClose}
          w="full"
        >
          {t('common.cancel')}
        </ActionButton>
      </VStack>
    </MotionBox>
  )
}

export function NFTPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const {
    userAssets,
    priceInfo,
    fetchUserAssets,
    nftHoldings,
    nftHoldingStats,
    fetchUserNFTList,
    fetchUserNFTStats,
    nftLevelConfigs,
    fetchNFTLevelConfigs,
  } = usePayFiStore()

  // 辅助函数：根据等级获取配置
  const getNFTConfig = (level: string | null) => {
    if (!level || nftLevelConfigs.length === 0) return null
    return nftLevelConfigs.find(c => c.level === level) || null
  }

  // 使用 NFT 购买 hook
  const {
    step: purchaseStep,
    isLoading: isPurchasing,
    purchaseNFT,
    reset: resetPurchase,
    getStatusText: getPurchaseStatusText,
  } = useNFTPurchase()

  // 使用 NFT 质押 hook
  const {
    step: stakeStep,
    isLoading: isStakingLoading,
    stakeNFT: executeStakeNFT,
    reset: resetStake,
    getStatusText: getStakeStatusText,
  } = useNFTStake()

  const [selectedLevel, setSelectedLevel] = useState<NFTLevel>(null)
  const [showNFTSelector, setShowNFTSelector] = useState(false)
  const [selectorFilterLevel, setSelectorFilterLevel] = useState<string | null>(null)

  // 使用 store 中的 nftHoldings 替代本地状态
  const userNFTList = nftHoldings

  useEffect(() => {
    fetchUserAssets()
    fetchUserNFTStats()
    fetchUserNFTList(1, 50)
    fetchNFTLevelConfigs()
  }, [fetchUserAssets, fetchUserNFTStats, fetchUserNFTList, fetchNFTLevelConfigs])

  // 滚动穿透修复
  const showPurchaseOverlay = purchaseStep !== 'idle'
  const showStakeOverlay = stakeStep !== 'idle'
  const showAnyOverlay = showPurchaseOverlay || showStakeOverlay || showNFTSelector

  useEffect(() => {
    if (showAnyOverlay) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [showAnyOverlay])

  const currentLevel = userAssets?.currentNFTLevel ?? null
  const currentConfig = getNFTConfig(currentLevel)
  const currentLevelIndex = currentLevel
    ? nftLevelConfigs.findIndex(c => c.level === currentLevel)
    : -1

  // 计算选中等级的索引
  const selectedLevelIndex = selectedLevel
    ? nftLevelConfigs.findIndex(c => c.level === selectedLevel)
    : -1

  // 判断是否为升级（选中等级高于当前等级）
  const isUpgradeAction = currentLevelIndex >= 0 && selectedLevelIndex > currentLevelIndex

  // 检查用户是否持有 NFT（但可能未质押）
  const hasNFTHoldings = (nftHoldingStats?.totalCount ?? 0) > 0

  // 计算质押统计
  const totalNFTCount = userNFTList.length
  const stakedNFTCount = userNFTList.filter(n => n.isStaked).length
  const hasUnstakedNFTs = totalNFTCount - stakedNFTCount > 0

  // 获取用户 USDT 余额
  const usdtBalance = userAssets?.usdtBalance ?? 0

  // 获取全局质押开关
  const isStakingEnabled = userAssets?.featureFlags?.pidStakingEnabled ?? false

  // 获取选中等级的配置和价格
  const selectedConfig = getNFTConfig(selectedLevel)
  const selectedPrice = selectedConfig?.price ?? 0

  // 检查 USDT 余额是否足够购买选中的 NFT
  const hasInsufficientBalance = !!selectedLevel && usdtBalance < selectedPrice

  // 处理购买/升级
  const handlePurchaseOrUpgrade = async () => {
    if (!selectedLevel || isPurchasing) return

    const isUpgrade = isUpgradeAction
    console.log('[NFTPage] 开始购买/升级:', { selectedLevel, isUpgrade })

    const success = await purchaseNFT(selectedLevel, isUpgrade)
    console.log('[NFTPage] 购买结果:', success)

    if (success) {
      // 刷新用户资产、NFT 持有统计和 NFT 列表
      await fetchUserAssets()
      await fetchUserNFTStats()
      await fetchUserNFTList(1, 50)
      setSelectedLevel(null)
    }
  }

  // 关闭购买蒙版
  const handleClosePurchaseOverlay = () => {
    resetPurchase()
    if (purchaseStep === 'success') {
      setSelectedLevel(null)
    }
  }

  // 关闭质押蒙版
  const handleCloseStakeOverlay = async () => {
    resetStake()
    if (stakeStep === 'success') {
      // 刷新用户资产和 NFT 列表
      await fetchUserAssets()
      await fetchUserNFTStats()
      await fetchUserNFTList(1, 50)
    }
  }

  // 获取未质押的 NFT 列表（全部）
  const allUnstakedNFTs = userNFTList.filter(nft => !nft.isStaked)

  // 根据过滤等级获取未质押的 NFT 列表
  const filteredUnstakedNFTs = selectorFilterLevel
    ? allUnstakedNFTs.filter(nft => nft.nftLevel === selectorFilterLevel)
    : allUnstakedNFTs

  // 打开 NFT 选择器（可选传入过滤等级）
  const handleOpenNFTSelector = (filterLevel?: string) => {
    if (isStakingLoading) return
    const targetNFTs = filterLevel
      ? allUnstakedNFTs.filter(nft => nft.nftLevel === filterLevel)
      : allUnstakedNFTs
    if (targetNFTs.length === 0) return
    setSelectorFilterLevel(filterLevel || null)
    setShowNFTSelector(true)
  }

  // 关闭 NFT 选择器
  const handleCloseNFTSelector = () => {
    setShowNFTSelector(false)
    setSelectorFilterLevel(null)
  }

  // 选择 NFT 并质押
  const handleSelectAndStake = async (nft: UserNFTItem) => {
    console.log('[NFTPage] 选择质押 NFT:', nft)
    setShowNFTSelector(false)
    const success = await executeStakeNFT(nft)
    console.log('[NFTPage] 质押结果:', success)
  }

  return (
    <Box minH="100vh" bg="#111111">
      {/* 购买进度蒙版 */}
      <AnimatePresence>
        {showPurchaseOverlay && (
          <PurchaseOverlay
            step={purchaseStep}
            statusText={getPurchaseStatusText()}
            onClose={handleClosePurchaseOverlay}
          />
        )}
      </AnimatePresence>

      {/* 质押进度蒙版 */}
      <AnimatePresence>
        {showStakeOverlay && (
          <StakeOverlay
            step={stakeStep}
            statusText={getStakeStatusText()}
            onClose={handleCloseStakeOverlay}
          />
        )}
      </AnimatePresence>

      {/* NFT 选择器蒙版 */}
      <AnimatePresence>
        {showNFTSelector && (
          <NFTSelectorOverlay
            nfts={filteredUnstakedNFTs}
            filterLevel={selectorFilterLevel}
            onSelect={handleSelectAndStake}
            onClose={handleCloseNFTSelector}
          />
        )}
      </AnimatePresence>

      <PageHeader title={t('nav.nft')} />

      <VStack gap="5" p="4" align="stretch">
        {/* 当前等级横幅 */}
        <GradientBorderCard glowIntensity={currentLevel ? 'medium' : 'low'} staticBorder>
          <MotionBox
            p="4"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <HStack justify="space-between" align="center">
              <VStack align="start" gap={1}>
                <HStack gap={1}>
                  <Sparkle size={14} weight="fill" color="#8A8A90" />
                  <Text fontSize="sm" color="whiteAlpha.600">{t('nft.current_level')}</Text>
                </HStack>
                {currentLevel ? (
                  <HStack gap={2}>
                    <NFTBadge level={currentLevel} size="lg" showName />
                  </HStack>
                ) : hasNFTHoldings ? (
                  <Text fontSize="lg" fontWeight="bold" color="white">
                    {t('nft.not_staked_hint')}
                  </Text>
                ) : (
                  <Text fontSize="lg" fontWeight="bold" color="whiteAlpha.400">
                    {t('nft.no_nft')}
                  </Text>
                )}
              </VStack>

              {currentConfig && (
                <VStack align="end" gap={0}>
                  <Text fontSize="xs" color="whiteAlpha.500">
                    {t('nft.power_coefficient')} {currentConfig.coefficient}x
                  </Text>
                  <Text fontSize="xs" color="whiteAlpha.500">
                    {t('nft.pool_multiplier')} {currentConfig.nftExitMultiplier}x
                  </Text>
                </VStack>
              )}
            </HStack>
          </MotionBox>
        </GradientBorderCard>

        {/* 质押挖矿卡片 - 仅在有未质押 NFT 时显示 */}
        {hasUnstakedNFTs && (
          <MotionBox
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <GradientBorderCard
              glowIntensity={stakedNFTCount > 0 ? 'medium' : 'low'}
              staticBorder
            >
              <Box
                p="4"
                cursor={isStakingEnabled ? 'pointer' : 'not-allowed'}
                opacity={isStakingEnabled ? 1 : 0.5}
                onClick={() => isStakingEnabled && handleOpenNFTSelector()}
                _hover={isStakingEnabled ? { bg: 'whiteAlpha.50' } : undefined}
                borderRadius="xl"
                transition="background-color 0.2s"
              >
                <HStack justify="space-between" align="start">
                  <HStack gap={2}>
                    <Box
                      w="8"
                      h="8"
                      borderRadius="lg"
                      bg={stakedNFTCount > 0 ? 'rgba(34, 197, 94, 0.2)' : 'rgba(255, 255, 255, 0.1)'}
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                    >
                      <HiOutlineCube
                        size={18}
                        color={stakedNFTCount > 0 ? '#22C55E' : 'white'}
                      />
                    </Box>
                    <VStack align="start" gap={0}>
                      <Text fontSize="sm" fontWeight="600" color="white">
                        {t('nft.stake_mining')}
                      </Text>
                      <Text fontSize="xs" color="whiteAlpha.500">
                        {t('nft.stake_to_mine')}
                      </Text>
                    </VStack>
                  </HStack>

                  <Box
                    px="2.5"
                    py="1"
                    borderRadius="full"
                    bg={stakedNFTCount > 0 ? 'rgba(34, 197, 94, 0.2)' : 'rgba(255, 255, 255, 0.15)'}
                  >
                    <Text
                      fontSize="xs"
                      fontWeight="bold"
                      color={stakedNFTCount > 0 ? '#22C55E' : 'white'}
                    >
                      {stakedNFTCount > 0
                        ? t('nft.staked_ratio', { staked: stakedNFTCount, total: totalNFTCount })
                        : t('nft.not_staked')}
                    </Text>
                  </Box>
                </HStack>
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
              bg="linear-gradient(90deg, #4A4A50 0%, #8A8A90 100%)"
              initial={{ width: 0 }}
              animate={{
                width: currentLevelIndex >= 0 && nftLevelConfigs.length > 1
                  ? `${(currentLevelIndex / (nftLevelConfigs.length - 1)) * 84}%`
                  : '0%',
              }}
              transition={{ duration: 0.8 }}
            />

            {/* 等级节点 */}
            {nftLevelConfigs.map((config, index) => {
              const isOwned = currentLevelIndex >= index
              const isCurrent = currentLevel === config.level
              const isSelected = selectedLevel === config.level

              return (
                <VStack
                  key={config.level}
                  gap={1}
                  zIndex={1}
                  cursor="pointer"
                  onClick={() => setSelectedLevel(config.level as NFTLevel)}
                >
                  <MotionBox
                    w={isCurrent || isSelected ? 10 : 8}
                    h={isCurrent || isSelected ? 10 : 8}
                    borderRadius="full"
                    bg={isOwned ? '#5A5A60' : isSelected ? '#8A8A90' : 'whiteAlpha.200'}
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    borderWidth={isSelected ? 2 : 0}
                    borderColor="#9A9A9F"
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
                    color={isCurrent ? 'white' : isSelected ? '#AEAEB3' : 'whiteAlpha.500'}
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
                        {t(`nft_level.${selectedConfig.level}`)}
                      </Text>
                    </HStack>
                    {isUpgradeAction && (
                      <HStack gap={1}>
                        <HiOutlineArrowUp size={14} color="#22C55E" />
                        <Text fontSize="sm" color="#22C55E">
                          {t('nft.upgrade_from', { from: currentLevel })}
                        </Text>
                      </HStack>
                    )}
                  </VStack>
                </HStack>

                {/* 属性网格 */}
                <SimpleGrid columns={2} gap={3} mb="4">
                  <Box bg="whiteAlpha.50" borderRadius="lg" p="3">
                    <HStack gap={1} mb={1}>
                      <Text fontSize="xs" color="whiteAlpha.500">{t('nft.price')}</Text>
                    </HStack>
                    <Text fontSize="lg" fontWeight="bold" color="white">
                      ${selectedConfig.price.toLocaleString()}
                    </Text>
                  </Box>

                  <Box bg="whiteAlpha.50" borderRadius="lg" p="3">
                    <HStack gap={1} mb={1}>
                      <HiOutlineBolt size={12} color="#9A9A9F" />
                      <Text fontSize="xs" color="whiteAlpha.500">{t('nft.base_power')}</Text>
                    </HStack>
                    <Text fontSize="lg" fontWeight="bold" color="white">
                      {selectedConfig.power.toLocaleString()}
                    </Text>
                  </Box>

                  <Box bg="whiteAlpha.50" borderRadius="lg" p="3">
                    <HStack gap={1} mb={1}>
                      <HiOutlineSparkles size={12} color="#8A8A90" />
                      <Text fontSize="xs" color="whiteAlpha.500">{t('nft.power_coefficient')}</Text>
                    </HStack>
                    <Text fontSize="lg" fontWeight="bold" color="white">
                      {selectedConfig.coefficient}x
                    </Text>
                  </Box>

                  <Box bg="whiteAlpha.50" borderRadius="lg" p="3">
                    <HStack gap={1} mb={1}>
                      <HiOutlineShieldCheck size={12} color="#22C55E" />
                      <Text fontSize="xs" color="whiteAlpha.500">{t('nft.pool_multiplier')}</Text>
                    </HStack>
                    <Text fontSize="lg" fontWeight="bold" color="white">
                      NFT {selectedConfig.nftExitMultiplier}x
                    </Text>
                    <Text fontSize="xs" color="whiteAlpha.500">
                      {t('nft.burn_pic')} {selectedConfig.burnExitMultiplier}x
                    </Text>
                  </Box>
                </SimpleGrid>

                {/* 获得 PID 预估 */}
                {priceInfo && priceInfo.pidPrice > 0 && (
                  <Box
                    bg="rgba(74, 74, 80, 0.15)"
                    borderRadius="lg"
                    p="3"
                    mb="4"
                  >
                    <Text fontSize="xs" color="whiteAlpha.600" mb="1">
                      {t('nft.estimated_pid')}
                    </Text>
                    <Text fontSize="xl" fontWeight="bold" color="#9A9A9F">
                      {(selectedConfig.price / priceInfo.pidPrice).toFixed(2)} PID
                    </Text>
                    <Text fontSize="xs" color="whiteAlpha.500">
                      {t('nft.current_pid_price')}: ${priceInfo.pidPrice.toFixed(4)}
                    </Text>
                  </Box>
                )}

                {/* 余额不足警告 */}
                {hasInsufficientBalance && (
                  <Box
                    bg="rgba(239, 68, 68, 0.1)"
                    borderRadius="lg"
                    p="3"
                    mb="4"
                    borderWidth={1}
                    borderColor="rgba(239, 68, 68, 0.3)"
                  >
                    <HStack gap={2}>
                      <HiOutlineExclamationCircle size={18} color="#EF4444" />
                      <VStack align="start" gap={0}>
                        <Text fontSize="sm" color="#EF4444" fontWeight="600">
                          {t('nft.insufficient_balance')}
                        </Text>
                        <Text fontSize="xs" color="whiteAlpha.500">
                          {t('nft.balance_hint', {
                            balance: usdtBalance.toFixed(2),
                            required: selectedPrice.toFixed(2),
                          })}
                        </Text>
                      </VStack>
                    </HStack>
                  </Box>
                )}

                {/* 质押 + 购买/升级按钮 */}
                <HStack gap={3} w="full">
                  {/* 质押按钮 - 仅在有未质押 NFT 时显示 */}
                  {selectedLevel && allUnstakedNFTs.filter(n => n.nftLevel === selectedLevel).length > 0 && (
                    <ActionButton
                      variant="secondary"
                      flex={1}
                      size="lg"
                      onClick={() => handleOpenNFTSelector(selectedLevel)}
                      disabled={isStakingLoading || !isStakingEnabled}
                    >
                      <HStack gap={2} justify="center">
                        {isStakingLoading ? (
                          <Text>{t('nft.staking')}</Text>
                        ) : (
                          <>
                            <HiOutlinePlay size={18} />
                            <Text>{t('nft.stake')}</Text>
                          </>
                        )}
                      </HStack>
                    </ActionButton>
                  )}

                  {/* 购买/升级按钮 */}
                  <ActionButton
                    variant="primary"
                    flex={1}
                    size="lg"
                    onClick={handlePurchaseOrUpgrade}
                    disabled={isPurchasing || hasInsufficientBalance}
                  >
                    <HStack gap={2} justify="center">
                      {isPurchasing ? (
                        <Text>{t('common.processing')}</Text>
                      ) : isUpgradeAction ? (
                        <Text>{t('nft.upgrade_to', { level: selectedConfig.level })}</Text>
                      ) : (
                        <>
                          <HiOutlineShoppingCart size={18} />
                          <Text>{t('nft.purchase_level', { level: selectedConfig.level })}</Text>
                        </>
                      )}
                    </HStack>
                  </ActionButton>
                </HStack>

                {/* USDT 余额显示 - 仅在余额充足时显示 */}
                {!hasInsufficientBalance && (
                  <Flex justify="center" mt="3">
                    <Text fontSize="xs" color="whiteAlpha.500">
                      {t('nft.wallet_balance')}: {usdtBalance.toFixed(2)} USDT
                    </Text>
                  </Flex>
                )}
              </Box>
            </GradientBorderCard>
          </MotionBox>
        )}

        {/* 等级列表 */}
        <Box>
          <Flex justify="space-between" align="center" mb="3">
            <Text fontSize="sm" fontWeight="600" color="whiteAlpha.600">
              {t('nft.all_levels')}
            </Text>
            <HStack
              gap={1}
              cursor="pointer"
              onClick={() => navigate('/nft-list')}
              _hover={{ opacity: 0.8 }}
            >
              <HiOutlineQueueList size={14} color="rgba(255, 255, 255, 0.6)" />
              <Text fontSize="sm" fontWeight="600" color="whiteAlpha.600">
                {t('nft.mint_list')}
              </Text>
            </HStack>
          </Flex>
          <VStack gap={2}>
            {nftLevelConfigs.map((config, index) => {
              const isOwned = currentLevelIndex >= index
              const isCurrent = currentLevel === config.level

              return (
                <MotionBox
                  key={config.level}
                  w="full"
                  bg={isCurrent ? 'rgba(74, 74, 80, 0.15)' : '#17171C'}
                  borderRadius="xl"
                  p="4"
                  borderWidth={isCurrent ? 1 : 0}
                  borderColor="#4A4A50"
                  cursor="pointer"
                  onClick={() => setSelectedLevel(config.level as NFTLevel)}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Flex justify="space-between" align="center">
                    <HStack gap={3}>
                      <NFTBadge level={config.level as NFTLevel} size="md" />
                      <VStack align="start" gap={0}>
                        <Text fontSize="sm" fontWeight="600" color="white">
                          {t(`nft_level.${config.level}`)}
                        </Text>
                        <Text fontSize="xs" color="whiteAlpha.500">
                          ${config.price.toLocaleString()} · {t('nft.power')} {config.power}
                        </Text>
                      </VStack>
                    </HStack>

                    <HStack gap={2}>
                      {/* 持有数量 - 始终显示 */}
                      <Text fontSize="xs" color="whiteAlpha.500">
                        {t('nft.holding_count', { count: config.level ? (nftHoldingStats?.byType?.[config.level] ?? 0) : 0 })}
                      </Text>
                      {isCurrent && (
                        <Box
                          px="2"
                          py="0.5"
                          bg="#4A4A50"
                          borderRadius="full"
                        >
                          <Text fontSize="xs" color="white" fontWeight="bold">
                            {t('nft.current')}
                          </Text>
                        </Box>
                      )}
                      {isOwned && !isCurrent && (
                        <HiOutlineCheck size={20} color="#22C55E" />
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
