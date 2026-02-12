// 资产页面 - 数字金库（一级页面）

import { Box, VStack } from '@chakra-ui/react'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import {
  AssetCard,
  BurnSection,
  PicSwapSection,
  PIDReleaseCard,
  StakingSection,
  SwapSection,
} from '../components/assets'
import { PageHeader } from '../components/common'
import { usePayFiStore } from '../stores/payfiStore'

export function AssetsPage() {
  const { t } = useTranslation()
  const { fetchUserAssets, fetchPIDReleasePlans, fetchNFTLevelConfigs, fetchSystemConfig } = usePayFiStore()

  useEffect(() => {
    fetchUserAssets()
    fetchPIDReleasePlans()
    fetchNFTLevelConfigs()
    fetchSystemConfig()
  }, [fetchUserAssets, fetchPIDReleasePlans, fetchNFTLevelConfigs, fetchSystemConfig])

  return (
    <Box minH="100vh" bg="#111111">
      <PageHeader title={t('assets.title')} />
      <VStack gap="5" p="4" align="stretch">
        <AssetCard type="PID" />
        <AssetCard type="PIC" />
        <PicSwapSection />
        <BurnSection />
        <StakingSection />
        <PIDReleaseCard />
        <SwapSection />
        <Box h="8" />
      </VStack>
    </Box>
  )
}
