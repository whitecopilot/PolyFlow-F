// NFT 列表页面 - 二级页面

import { Box, Flex, HStack, Text, VStack } from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { HiOutlineArrowDownLeft, HiOutlineCube, HiOutlineShoppingCart } from 'react-icons/hi2'
import type { UserNFTItem } from '../api/types'
import { NFTBadge } from '../components/common'
import { SecondaryPageHeader } from '../components/layout'
import { usePayFiStore } from '../stores/payfiStore'

const MotionBox = motion.create(Box)

type FilterType = 'all' | 'purchase' | 'transfer'

export function NFTListPage() {
  const { t } = useTranslation()
  const { nftHoldings, nftHoldingStats, fetchUserNFTList, fetchUserNFTStats } = usePayFiStore()
  const [activeTab, setActiveTab] = useState<FilterType>('all')

  useEffect(() => {
    fetchUserNFTList(1, 100)
    fetchUserNFTStats()
  }, [fetchUserNFTList, fetchUserNFTStats])

  const filteredNFTs = nftHoldings.filter((nft) => {
    if (activeTab === 'all') return true
    return nft.source === activeTab
  })

  const purchaseCount = nftHoldings.filter((nft) => nft.source === 'purchase').length
  const transferCount = nftHoldings.filter((nft) => nft.source === 'transfer').length

  return (
    <Box minH="100vh" bg="black">
      <SecondaryPageHeader title={t('nft.nft_list_title')} />

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
                bg="rgba(216, 17, 240, 0.15)"
                align="center"
                justify="center"
              >
                <HiOutlineCube size={20} color="#D811F0" />
              </Flex>
              <Box>
                <Text fontSize="sm" color="whiteAlpha.600">
                  {t('nft.nft_list_title')}
                </Text>
                <Text fontSize="xl" fontWeight="bold" color="white">
                  {nftHoldingStats?.totalCount ?? nftHoldings.length}
                </Text>
              </Box>
            </HStack>
            <VStack align="end" gap={0}>
              <HStack gap={1}>
                <HiOutlineShoppingCart size={12} color="#22C55E" />
                <Text fontSize="sm" color="#22C55E">
                  {purchaseCount}
                </Text>
              </HStack>
              <HStack gap={1}>
                <HiOutlineArrowDownLeft size={12} color="#06B6D4" />
                <Text fontSize="sm" color="#06B6D4">
                  {transferCount}
                </Text>
              </HStack>
            </VStack>
          </Flex>
        </MotionBox>

        {/* 筛选标签 */}
        <HStack gap={2}>
          <FilterTab
            active={activeTab === 'all'}
            onClick={() => setActiveTab('all')}
            label={`${t('nft.filter_all')} (${nftHoldings.length})`}
          />
          <FilterTab
            active={activeTab === 'purchase'}
            onClick={() => setActiveTab('purchase')}
            label={`${t('nft.filter_purchase')} (${purchaseCount})`}
          />
          <FilterTab
            active={activeTab === 'transfer'}
            onClick={() => setActiveTab('transfer')}
            label={`${t('nft.filter_transfer')} (${transferCount})`}
          />
        </HStack>

        {/* NFT 列表 */}
        {filteredNFTs.length === 0 ? (
          <EmptyState />
        ) : (
          <VStack gap={2} align="stretch">
            {filteredNFTs.map((nft, index) => (
              <NFTItem key={nft.id} nft={nft} delay={index * 0.03} />
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
      bg={active ? '#D811F0' : 'whiteAlpha.100'}
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

interface NFTItemProps {
  nft: UserNFTItem
  delay: number
}

function NFTItem({ nft, delay }: NFTItemProps) {
  const { t } = useTranslation()

  const isPurchase = nft.source === 'purchase'

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
          <NFTBadge level={nft.nftLevel as 'N1' | 'N2' | 'N3' | 'N4' | 'N5'} size="md" />
          <Box>
            <HStack gap={2}>
              <Text fontSize="sm" fontWeight="600" color="white">
                #{nft.tokenId}
              </Text>
              <Box
                px="2"
                py="0.5"
                borderRadius="full"
                bg={isPurchase ? 'rgba(34, 197, 94, 0.2)' : 'rgba(6, 182, 212, 0.2)'}
              >
                <HStack gap={1}>
                  {isPurchase ? (
                    <HiOutlineShoppingCart size={10} color="#22C55E" />
                  ) : (
                    <HiOutlineArrowDownLeft size={10} color="#06B6D4" />
                  )}
                  <Text
                    fontSize="10px"
                    fontWeight="600"
                    color={isPurchase ? '#22C55E' : '#06B6D4'}
                  >
                    {isPurchase ? t('nft.source_purchase') : t('nft.source_transfer')}
                  </Text>
                </HStack>
              </Box>
            </HStack>
            <Text fontSize="xs" color="whiteAlpha.500" mt={1}>
              {t('nft.power')}: {nft.power}
            </Text>
          </Box>
        </HStack>
        <VStack align="end" gap={0}>
          {nft.isStaked && (
            <Box
              px="2"
              py="0.5"
              borderRadius="full"
              bg="rgba(34, 197, 94, 0.2)"
            >
              <Text fontSize="10px" color="#22C55E" fontWeight="600">
                {t('nft.mining')}
              </Text>
            </Box>
          )}
          <Text fontSize="xs" color="whiteAlpha.500" mt={nft.isStaked ? 1 : 0}>
            {nft.createdAt}
          </Text>
        </VStack>
      </Flex>
    </MotionBox>
  )
}

function EmptyState() {
  const { t } = useTranslation()
  return (
    <Flex
      direction="column"
      align="center"
      justify="center"
      py="16"
      color="whiteAlpha.400"
    >
      <HiOutlineCube size={48} />
      <Text mt="4" fontSize="sm">
        {t('nft.no_nft_holdings')}
      </Text>
    </Flex>
  )
}
