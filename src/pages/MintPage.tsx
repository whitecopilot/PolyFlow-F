import { useState } from 'react'
import { Box, Flex, Text, VStack, SimpleGrid } from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { PageHeader, ActionButton, NFTImage } from '../components/common'
import { useStakingStore } from '../stores/stakingStore'
import {
  HiOutlineSparkles,
  HiOutlineCube,
  HiOutlineCheckCircle,
} from 'react-icons/hi2'

const MotionBox = motion.create(Box)

interface NFTTier {
  id: string
  name: string
  category: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond'
  price: string
  boost: string
  supply: number
  minted: number
  benefits: string[]
}

const nftTiers: NFTTier[] = [
  {
    id: 'bronze',
    name: 'Bronze',
    category: 'bronze',
    price: '100',
    boost: '5%',
    supply: 10000,
    minted: 8765,
    benefits: ['5% 收益加成', '基础会员权益', '社区投票权'],
  },
  {
    id: 'silver',
    name: 'Silver',
    category: 'silver',
    price: '500',
    boost: '10%',
    supply: 5000,
    minted: 3210,
    benefits: ['10% 收益加成', '高级会员权益', '优先参与活动', '专属客服'],
  },
  {
    id: 'gold',
    name: 'Gold',
    category: 'gold',
    price: '2000',
    boost: '20%',
    supply: 2000,
    minted: 876,
    benefits: ['20% 收益加成', '白金会员权益', '空投加倍', 'VIP 社群', '线下活动'],
  },
  {
    id: 'platinum',
    name: 'Platinum',
    category: 'platinum',
    price: '5000',
    boost: '35%',
    supply: 500,
    minted: 123,
    benefits: ['35% 收益加成', '钻石会员权益', '治理提案权', '专属顾问', 'NFT 空投'],
  },
  {
    id: 'diamond',
    name: 'Diamond',
    category: 'diamond',
    price: '20000',
    boost: '50%',
    supply: 100,
    minted: 23,
    benefits: ['50% 收益加成', '最高权益等级', '收益分红', '全额空投', '定制服务'],
  },
]

export function MintPage() {
  const { t } = useTranslation()
  const [selectedTier, setSelectedTier] = useState<string | null>(null)
  const [isMinting, setIsMinting] = useState(false)
  const { tokenBalance, setNFTs, nfts } = useStakingStore()

  const handleMint = async () => {
    if (!selectedTier) return

    const tier = nftTiers.find((t) => t.id === selectedTier)
    if (!tier) return

    if (parseFloat(tokenBalance) < parseFloat(tier.price)) {
      alert(t('mint.alert_insufficient'))
      return
    }

    setIsMinting(true)
    await new Promise((r) => setTimeout(r, 2000))

    // 添加新 NFT
    const newNFT = {
      id: `${Date.now()}`,
      name: `PolyFlow #${String(Math.floor(Math.random() * 9000) + 1000)}`,
      category: tier.category,
      imageUrl: `/nft-${tier.category}.png`,
      isStaked: false,
    }

    setNFTs([...nfts, newNFT])
    setIsMinting(false)
    setSelectedTier(null)
  }

  const selected = nftTiers.find((t) => t.id === selectedTier)

  return (
    <Box>
      <PageHeader title={t('mint.title')} />

      <VStack gap="5" p="4" align="stretch">
        {/* 说明卡片 */}
        <MotionBox
          bg="linear-gradient(135deg, rgba(245, 158, 11, 0.2) 0%, rgba(79, 70, 229, 0.1) 100%)"
          borderRadius="20px"
          p="5"
          border="1px solid"
          borderColor="rgba(245, 158, 11, 0.3)"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Flex justify="space-between" align="flex-start" mb="3">
            <Box>
              <Text fontSize="sm" color="text.muted" mb="1">
                PolyFlow NFT
              </Text>
              <Text fontSize="lg" fontWeight="600" color="text.primary">
                {t('mint.subtitle')}
              </Text>
            </Box>
            <Flex
              w="48px"
              h="48px"
              borderRadius="14px"
              bg="rgba(245, 158, 11, 0.2)"
              align="center"
              justify="center"
            >
              <HiOutlineSparkles size={24} color="#F59E0B" />
            </Flex>
          </Flex>
          <Text fontSize="xs" color="text.muted" lineHeight="1.6">
            {t('mint.description')}
          </Text>
        </MotionBox>

        {/* 可用余额 */}
        <Flex
          justify="space-between"
          align="center"
          bg="bg.card"
          borderRadius="12px"
          p="3"
          border="1px solid"
          borderColor="border.default"
        >
          <Text fontSize="sm" color="text.muted">
            {t('mint.available_balance')}
          </Text>
          <Text fontSize="sm" fontWeight="600" color="text.primary">
            {parseFloat(tokenBalance).toLocaleString()} PFT
          </Text>
        </Flex>

        {/* NFT 等级选择 */}
        <Box>
          <Text fontSize="sm" fontWeight="600" color="text.secondary" mb="3">
            {t('mint.select_tier')}
          </Text>

          <VStack gap="3" align="stretch">
            {nftTiers.map((tier, index) => (
              <NFTTierCard
                key={tier.id}
                tier={tier}
                selected={selectedTier === tier.id}
                onSelect={() => setSelectedTier(tier.id)}
                delay={index * 0.05}
              />
            ))}
          </VStack>
        </Box>

        {/* 铸造确认 */}
        {selected && (
          <MotionBox
            bg="bg.card"
            borderRadius="16px"
            p="4"
            border="1px solid"
            borderColor="brand.primary"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            transition={{ duration: 0.3 }}
          >
            <Flex justify="space-between" align="center" mb="4">
              <Text fontSize="sm" fontWeight="600" color="text.primary">
                {t('mint.confirm_mint')}
              </Text>
              <Text fontSize="sm" color="text.muted">
                {selected.name} NFT
              </Text>
            </Flex>

            <SimpleGrid columns={2} gap="3" mb="4">
              <Box>
                <Text fontSize="xs" color="text.muted">
                  {t('mint.price')}
                </Text>
                <Text fontSize="md" fontWeight="600" color="text.primary">
                  {selected.price} PFT
                </Text>
              </Box>
              <Box>
                <Text fontSize="xs" color="text.muted">
                  {t('mint.reward_boost')}
                </Text>
                <Text fontSize="md" fontWeight="600" color="accent.green">
                  +{selected.boost}
                </Text>
              </Box>
            </SimpleGrid>

            <ActionButton
              w="100%"
              variant="primary"
              onClick={handleMint}
              loading={isMinting}
              loadingText={t('mint.minting')}
              disabled={parseFloat(tokenBalance) < parseFloat(selected.price)}
            >
              <Flex align="center" gap="2">
                <HiOutlineCube size={18} />
                <Text>{t('mint.confirm_mint_button')}</Text>
              </Flex>
            </ActionButton>

            {parseFloat(tokenBalance) < parseFloat(selected.price) && (
              <Text fontSize="xs" color="error" textAlign="center" mt="2">
                {t('mint.insufficient_need', { price: selected.price })}
              </Text>
            )}
          </MotionBox>
        )}

        {/* 注意事项 */}
        <Box
          bg="bg.card"
          borderRadius="14px"
          p="4"
          border="1px solid"
          borderColor="border.default"
        >
          <Text fontSize="sm" fontWeight="600" color="text.secondary" mb="3">
            {t('mint.mint_instructions')}
          </Text>
          <VStack gap="2" align="stretch">
            <RuleItem text={t('mint.rule_1')} />
            <RuleItem text={t('mint.rule_2')} />
            <RuleItem text={t('mint.rule_3')} />
            <RuleItem text={t('mint.rule_4')} />
          </VStack>
        </Box>
      </VStack>
    </Box>
  )
}

interface NFTTierCardProps {
  tier: NFTTier
  selected: boolean
  onSelect: () => void
  delay: number
}

function NFTTierCard({ tier, selected, onSelect, delay }: NFTTierCardProps) {
  const { t } = useTranslation()
  const progress = (tier.minted / tier.supply) * 100
  const remaining = tier.supply - tier.minted

  return (
    <MotionBox
      bg="bg.card"
      borderRadius="16px"
      p="4"
      border="2px solid"
      borderColor={selected ? 'brand.primary' : 'border.default'}
      cursor="pointer"
      onClick={onSelect}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
      whileTap={{ scale: 0.98 }}
      position="relative"
    >
      {selected && (
        <Box
          position="absolute"
          top="3"
          right="3"
          color="brand.primary"
        >
          <HiOutlineCheckCircle size={22} />
        </Box>
      )}

      <Flex gap="4">
        {/* NFT 图标 */}
        <Flex
          w="70px"
          h="70px"
          borderRadius="14px"
          bg={`linear-gradient(135deg, ${getCategoryColor(tier.category)} 0%, rgba(0,0,0,0.3) 100%)`}
          align="center"
          justify="center"
          flexShrink={0}
        >
          <NFTImage
            src={`/nft-${tier.category}.png`}
            alt={tier.name}
            w="50px"
            h="50px"
            fallbackText={tier.name.charAt(0)}
          />
        </Flex>

        {/* 信息 */}
        <Box flex="1">
          <Flex justify="space-between" align="flex-start" mb="1">
            <Text fontSize="md" fontWeight="700" color="text.primary">
              {tier.name}
            </Text>
            <Text fontSize="sm" fontWeight="600" color="accent.green">
              +{tier.boost}
            </Text>
          </Flex>

          <Text fontSize="lg" fontWeight="600" color="brand.primary" mb="2">
            {tier.price} PFT
          </Text>

          {/* 进度条 */}
          <Box mb="1">
            <Flex justify="space-between" mb="1">
              <Text fontSize="10px" color="text.muted">
                {t('mint.remaining')} {remaining.toLocaleString()}
              </Text>
              <Text fontSize="10px" color="text.muted">
                {progress.toFixed(1)}%
              </Text>
            </Flex>
            <Box
              h="4px"
              bg="bg.input"
              borderRadius="full"
              overflow="hidden"
            >
              <Box
                h="100%"
                w={`${progress}%`}
                bg="brand.primary"
                borderRadius="full"
                transition="width 0.3s"
              />
            </Box>
          </Box>
        </Box>
      </Flex>

      {/* 权益列表 */}
      {selected && (
        <Box mt="4" pt="3" borderTop="1px solid" borderColor="border.default">
          <Text fontSize="xs" color="text.muted" mb="2">
            {t('mint.benefits_included')}
          </Text>
          <Flex gap="2" flexWrap="wrap">
            {tier.benefits.map((benefit, i) => (
              <Box
                key={i}
                px="2"
                py="1"
                bg="bg.input"
                borderRadius="6px"
                fontSize="10px"
                color="text.secondary"
              >
                {benefit}
              </Box>
            ))}
          </Flex>
        </Box>
      )}
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

function getCategoryColor(category: string): string {
  const colors: Record<string, string> = {
    bronze: 'rgba(205, 127, 50, 0.6)',
    silver: 'rgba(192, 192, 192, 0.6)',
    gold: 'rgba(255, 215, 0, 0.6)',
    platinum: 'rgba(229, 228, 226, 0.6)',
    diamond: 'rgba(185, 242, 255, 0.6)',
  }
  return colors[category] || colors.bronze
}
