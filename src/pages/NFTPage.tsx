// NFT 页面 - 等级殿堂

import { Box, VStack } from '@chakra-ui/react'
import { AnimatePresence } from 'framer-motion'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { LazyVideo, PageHeader } from '../components/common'
import {
  CurrentLevelBanner,
  LevelList,
  LevelProgressBar,
  NFTSelectorOverlay,
  ProgressOverlay,
  PurchaseCard,
  StakeMiningCard,
} from '../components/nft'
import { useNFTPurchase } from '../hooks/useNFTPurchase'
import { useNFTStake } from '../hooks/useNFTStake'
import { usePayFiStore } from '../stores/payfiStore'
import type { NFTLevel } from '../types/payfi'
import type { PaymentCurrency } from '../api/types'
import type { UserNFTItem } from '../api/types'

const NFT_VIDEO_BASE_URL = 'https://static.polyflow.global/'
const getNFTVideoUrl = (level: string) => `${NFT_VIDEO_BASE_URL}${level.toLowerCase()}.mp4`

export function NFTPage() {
  const { t } = useTranslation()
  const {
    nftHoldings,
    fetchUserAssets,
    fetchUserNFTList,
    fetchUserNFTStats,
    fetchNFTLevelConfigs,
  } = usePayFiStore()

  // 购买 hook
  const {
    step: purchaseStep,
    isLoading: isPurchasing,
    purchaseNFT,
    reset: resetPurchase,
    getStatusText: getPurchaseStatusText,
  } = useNFTPurchase()

  // 质押 hook
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

  useEffect(() => {
    fetchUserAssets()
    fetchUserNFTStats()
    fetchUserNFTList(1, 50)
    fetchNFTLevelConfigs()
  }, [fetchUserAssets, fetchUserNFTStats, fetchUserNFTList, fetchNFTLevelConfigs])

  // 统一滚动穿透修复（所有蒙版）
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

  // NFT 选择器
  const allUnstakedNFTs = nftHoldings.filter(nft => !nft.isStaked)

  const handleOpenNFTSelector = (filterLevel?: string) => {
    if (isStakingLoading) return
    const targetNFTs = filterLevel
      ? allUnstakedNFTs.filter(nft => nft.nftLevel === filterLevel)
      : allUnstakedNFTs
    if (targetNFTs.length === 0) return
    setSelectorFilterLevel(filterLevel || null)
    setShowNFTSelector(true)
  }

  const handleCloseNFTSelector = () => {
    setShowNFTSelector(false)
    setSelectorFilterLevel(null)
  }

  const handleSelectAndStake = async (nft: UserNFTItem) => {
    setShowNFTSelector(false)
    await executeStakeNFT(nft)
  }

  // 购买/升级
  const handlePurchase = async (level: NFTLevel, isUpgrade: boolean, currency: PaymentCurrency) => {
    if (!level || isPurchasing) return
    const success = await purchaseNFT(level, isUpgrade, currency)
    if (success) {
      await fetchUserAssets()
      await fetchUserNFTStats()
      await fetchUserNFTList(1, 50)
      setSelectedLevel(null)
    }
  }

  const handleClosePurchaseOverlay = () => {
    resetPurchase()
    if (purchaseStep === 'success') {
      setSelectedLevel(null)
    }
  }

  // 质押蒙版关闭
  const handleCloseStakeOverlay = async () => {
    resetStake()
    if (stakeStep === 'success') {
      await fetchUserAssets()
      await fetchUserNFTStats()
      await fetchUserNFTList(1, 50)
    }
  }

  // 进度映射
  const getPurchaseProgress = () => {
    switch (purchaseStep) {
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

  const getStakeProgress = () => {
    switch (stakeStep) {
      case 'preparing': return 1
      case 'signing': return 2
      case 'confirming': return 3
      case 'submitting': return 4
      case 'success': return 4
      case 'error': return 0
      default: return 0
    }
  }

  const filteredUnstakedNFTs = selectorFilterLevel
    ? allUnstakedNFTs.filter(nft => nft.nftLevel === selectorFilterLevel)
    : allUnstakedNFTs

  return (
    <Box minH="100vh" bg="#111111">
      {/* 购买进度蒙版 */}
      <AnimatePresence>
        {showPurchaseOverlay && (
          <ProgressOverlay
            progress={getPurchaseProgress()}
            totalSteps={5}
            isSuccess={purchaseStep === 'success'}
            isError={purchaseStep === 'error'}
            isSigningStep={purchaseStep === 'signing'}
            statusText={getPurchaseStatusText()}
            onClose={handleClosePurchaseOverlay}
          />
        )}
      </AnimatePresence>

      {/* 质押进度蒙版 */}
      <AnimatePresence>
        {showStakeOverlay && (
          <ProgressOverlay
            progress={getStakeProgress()}
            totalSteps={4}
            isSuccess={stakeStep === 'success'}
            isError={stakeStep === 'error'}
            isSigningStep={stakeStep === 'signing'}
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
        <CurrentLevelBanner />
        <StakeMiningCard
          isStakingLoading={isStakingLoading}
          onOpenSelector={() => handleOpenNFTSelector()}
        />
        <LevelProgressBar
          selectedLevel={selectedLevel}
          onSelectLevel={setSelectedLevel}
        />
        <PurchaseCard
          selectedLevel={selectedLevel}
          onSelectLevel={setSelectedLevel}
          onOpenNFTSelector={handleOpenNFTSelector}
          isStakingLoading={isStakingLoading}
          isPurchasing={isPurchasing}
          onPurchase={handlePurchase}
        />
        <LevelList onSelectLevel={setSelectedLevel} />

        <LazyVideo
          src={getNFTVideoUrl('N5')}
          width="100%"
          height="auto"
          aspectRatio="1/1"
          borderRadius="xl"
          rootMargin="200px 0px"
        />

        <Box h="24" />
      </VStack>
    </Box>
  )
}
