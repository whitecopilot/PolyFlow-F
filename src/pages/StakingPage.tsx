import { useState, useEffect } from 'react'
import { Box, Flex, Text, VStack, Input, SimpleGrid } from '@chakra-ui/react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSearchParams } from 'react-router-dom'
import { PageHeader, ActionButton, StatCard, NFTImage } from '../components/common'
import { useStakingStore, type NFTItem } from '../stores/stakingStore'
import {
  HiOutlineBanknotes,
  HiOutlineCube,
  HiOutlineArrowPath,
  HiOutlineCheckCircle,
} from 'react-icons/hi2'

const MotionBox = motion.create(Box)
const MotionFlex = motion.create(Flex)

type TabType = 'token' | 'nft'

export function StakingPage() {
  const [searchParams] = useSearchParams()
  const initialTab = searchParams.get('tab') === 'nft' ? 'nft' : 'token'
  const [activeTab, setActiveTab] = useState<TabType>(initialTab)
  const [stakeAmount, setStakeAmount] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [selectedNFTs, setSelectedNFTs] = useState<string[]>([])

  const {
    tokenBalance,
    stakingInfo,
    nfts,
    stakeToken,
    unstakeToken,
    stakeNFT,
    unstakeNFT,
  } = useStakingStore()

  useEffect(() => {
    const tab = searchParams.get('tab')
    if (tab === 'nft' || tab === 'token') {
      setActiveTab(tab)
    }
  }, [searchParams])

  const handleStakeToken = async () => {
    if (!stakeAmount || parseFloat(stakeAmount) <= 0) return
    setIsProcessing(true)
    await new Promise((r) => setTimeout(r, 1500))
    stakeToken(stakeAmount)
    setStakeAmount('')
    setIsProcessing(false)
  }

  const handleUnstakeToken = async () => {
    if (!stakeAmount || parseFloat(stakeAmount) <= 0) return
    setIsProcessing(true)
    await new Promise((r) => setTimeout(r, 1500))
    unstakeToken(stakeAmount)
    setStakeAmount('')
    setIsProcessing(false)
  }

  const handleStakeNFT = async () => {
    if (selectedNFTs.length === 0) return
    setIsProcessing(true)
    await new Promise((r) => setTimeout(r, 1500))
    selectedNFTs.forEach((id) => stakeNFT(id))
    setSelectedNFTs([])
    setIsProcessing(false)
  }

  const handleUnstakeNFT = async (nftId: string) => {
    setIsProcessing(true)
    await new Promise((r) => setTimeout(r, 1500))
    unstakeNFT(nftId)
    setIsProcessing(false)
  }

  const toggleNFTSelection = (nftId: string) => {
    setSelectedNFTs((prev) =>
      prev.includes(nftId)
        ? prev.filter((id) => id !== nftId)
        : [...prev, nftId]
    )
  }

  const unstakedNFTs = nfts.filter((nft) => !nft.isStaked)
  const stakedNFTs = nfts.filter((nft) => nft.isStaked)

  return (
    <Box>
      <PageHeader title="质押" />

      <VStack gap="5" p="4" align="stretch">
        {/* Tab 切换 */}
        <Flex
          bg="bg.card"
          borderRadius="14px"
          p="1"
          border="1px solid"
          borderColor="border.default"
        >
          <TabButton
            active={activeTab === 'token'}
            onClick={() => setActiveTab('token')}
            icon={<HiOutlineBanknotes size={18} />}
            label="Token 质押"
          />
          <TabButton
            active={activeTab === 'nft'}
            onClick={() => setActiveTab('nft')}
            icon={<HiOutlineCube size={18} />}
            label="NFT 质押"
          />
        </Flex>

        {/* 质押概览 */}
        <SimpleGrid columns={2} gap="3">
          <StatCard
            label="已质押 Token"
            value={stakingInfo.tokenStaked}
            unit="PFT"
            delay={0.1}
          />
          <StatCard
            label="已质押 NFT"
            value={stakingInfo.nftStaked.toString()}
            unit="个"
            delay={0.15}
          />
        </SimpleGrid>

        <AnimatePresence mode="wait">
          {activeTab === 'token' ? (
            <MotionBox
              key="token"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              <TokenStakingPanel
                balance={tokenBalance}
                staked={stakingInfo.tokenStaked}
                apr={stakingInfo.apr}
                amount={stakeAmount}
                onAmountChange={setStakeAmount}
                onStake={handleStakeToken}
                onUnstake={handleUnstakeToken}
                isProcessing={isProcessing}
              />
            </MotionBox>
          ) : (
            <MotionBox
              key="nft"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <NFTStakingPanel
                unstakedNFTs={unstakedNFTs}
                stakedNFTs={stakedNFTs}
                selectedNFTs={selectedNFTs}
                onToggleSelection={toggleNFTSelection}
                onStake={handleStakeNFT}
                onUnstake={handleUnstakeNFT}
                isProcessing={isProcessing}
              />
            </MotionBox>
          )}
        </AnimatePresence>
      </VStack>
    </Box>
  )
}

interface TabButtonProps {
  active: boolean
  onClick: () => void
  icon: React.ReactNode
  label: string
}

function TabButton({ active, onClick, icon, label }: TabButtonProps) {
  return (
    <Flex
      flex="1"
      align="center"
      justify="center"
      gap="2"
      py="3"
      borderRadius="10px"
      bg={active ? 'brand.primary' : 'transparent'}
      color={active ? 'white' : 'text.muted'}
      fontWeight="600"
      fontSize="sm"
      cursor="pointer"
      transition="all 0.2s"
      onClick={onClick}
    >
      {icon}
      <Text>{label}</Text>
    </Flex>
  )
}

interface TokenStakingPanelProps {
  balance: string
  staked: string
  apr: string
  amount: string
  onAmountChange: (value: string) => void
  onStake: () => void
  onUnstake: () => void
  isProcessing: boolean
}

function TokenStakingPanel({
  balance,
  staked,
  apr,
  amount,
  onAmountChange,
  onStake,
  onUnstake,
  isProcessing,
}: TokenStakingPanelProps) {
  const setMaxAmount = () => {
    onAmountChange(balance)
  }

  return (
    <VStack gap="4" align="stretch">
      {/* 输入区域 */}
      <Box
        bg="bg.card"
        borderRadius="16px"
        p="4"
        border="1px solid"
        borderColor="border.default"
      >
        <Flex justify="space-between" align="center" mb="3">
          <Text fontSize="sm" color="text.muted">
            质押数量
          </Text>
          <Flex align="center" gap="1">
            <Text fontSize="xs" color="text.muted">
              可用:
            </Text>
            <Text fontSize="xs" color="text.secondary" fontWeight="600">
              {parseFloat(balance).toLocaleString()} PFT
            </Text>
          </Flex>
        </Flex>

        <Flex
          bg="bg.input"
          borderRadius="12px"
          p="3"
          align="center"
          gap="3"
        >
          <Input
            type="number"
            placeholder="0.00"
            value={amount}
            onChange={(e) => onAmountChange(e.target.value)}
            bg="transparent"
            border="none"
            fontSize="xl"
            fontWeight="600"
            color="text.primary"
            _placeholder={{ color: 'text.disabled' }}
            _focus={{ outline: 'none', boxShadow: 'none' }}
            flex="1"
            p="0"
          />
          <Flex
            px="3"
            py="1.5"
            bg="rgba(79, 70, 229, 0.2)"
            borderRadius="8px"
            cursor="pointer"
            onClick={setMaxAmount}
          >
            <Text fontSize="xs" color="brand.primary" fontWeight="600">
              MAX
            </Text>
          </Flex>
        </Flex>

        {/* APR 展示 */}
        <Flex
          mt="4"
          p="3"
          bg="rgba(16, 185, 129, 0.1)"
          borderRadius="10px"
          justify="space-between"
          align="center"
        >
          <Text fontSize="sm" color="text.secondary">
            预估年化收益
          </Text>
          <Text fontSize="lg" fontWeight="700" color="accent.green">
            {apr}% APR
          </Text>
        </Flex>
      </Box>

      {/* 操作按钮 */}
      <Flex gap="3">
        <ActionButton
          flex="1"
          variant="primary"
          onClick={onStake}
          loading={isProcessing}
          disabled={!amount || parseFloat(amount) <= 0 || parseFloat(amount) > parseFloat(balance)}
        >
          <Flex align="center" gap="2">
            <HiOutlineBanknotes size={18} />
            <Text>质押</Text>
          </Flex>
        </ActionButton>
        <ActionButton
          flex="1"
          variant="secondary"
          onClick={onUnstake}
          loading={isProcessing}
          disabled={!amount || parseFloat(amount) <= 0 || parseFloat(amount) > parseFloat(staked)}
        >
          <Flex align="center" gap="2">
            <HiOutlineArrowPath size={18} />
            <Text>取消质押</Text>
          </Flex>
        </ActionButton>
      </Flex>

      {/* 质押说明 */}
      <Box
        bg="bg.card"
        borderRadius="14px"
        p="4"
        border="1px solid"
        borderColor="border.default"
      >
        <Text fontSize="sm" fontWeight="600" color="text.secondary" mb="3">
          质押说明
        </Text>
        <VStack gap="2" align="stretch">
          <RuleItem text="质押即时生效，收益每日结算" />
          <RuleItem text="取消质押无锁定期，可随时提取" />
          <RuleItem text="持有 NFT 可获得额外收益加成" />
        </VStack>
      </Box>
    </VStack>
  )
}

interface NFTStakingPanelProps {
  unstakedNFTs: NFTItem[]
  stakedNFTs: NFTItem[]
  selectedNFTs: string[]
  onToggleSelection: (id: string) => void
  onStake: () => void
  onUnstake: (id: string) => void
  isProcessing: boolean
}

function NFTStakingPanel({
  unstakedNFTs,
  stakedNFTs,
  selectedNFTs,
  onToggleSelection,
  onStake,
  onUnstake,
  isProcessing,
}: NFTStakingPanelProps) {
  return (
    <VStack gap="5" align="stretch">
      {/* 可质押的 NFT */}
      <Box>
        <Flex justify="space-between" align="center" mb="3">
          <Text fontSize="sm" fontWeight="600" color="text.secondary">
            可质押 NFT ({unstakedNFTs.length})
          </Text>
          {selectedNFTs.length > 0 && (
            <Text fontSize="xs" color="brand.primary">
              已选 {selectedNFTs.length} 个
            </Text>
          )}
        </Flex>

        {unstakedNFTs.length > 0 ? (
          <SimpleGrid columns={2} gap="3">
            {unstakedNFTs.map((nft, index) => (
              <NFTCard
                key={nft.id}
                nft={nft}
                selected={selectedNFTs.includes(nft.id)}
                onSelect={() => onToggleSelection(nft.id)}
                delay={index * 0.05}
              />
            ))}
          </SimpleGrid>
        ) : (
          <EmptyState text="暂无可质押的 NFT" />
        )}

        {selectedNFTs.length > 0 && (
          <ActionButton
            w="100%"
            variant="primary"
            mt="4"
            onClick={onStake}
            loading={isProcessing}
          >
            质押选中的 {selectedNFTs.length} 个 NFT
          </ActionButton>
        )}
      </Box>

      {/* 已质押的 NFT */}
      <Box>
        <Text fontSize="sm" fontWeight="600" color="text.secondary" mb="3">
          已质押 NFT ({stakedNFTs.length})
        </Text>

        {stakedNFTs.length > 0 ? (
          <VStack gap="3" align="stretch">
            {stakedNFTs.map((nft, index) => (
              <StakedNFTItem
                key={nft.id}
                nft={nft}
                onUnstake={() => onUnstake(nft.id)}
                isProcessing={isProcessing}
                delay={index * 0.05}
              />
            ))}
          </VStack>
        ) : (
          <EmptyState text="暂无质押中的 NFT" />
        )}
      </Box>

      {/* 质押说明 */}
      <Box
        bg="bg.card"
        borderRadius="14px"
        p="4"
        border="1px solid"
        borderColor="border.default"
      >
        <Text fontSize="sm" fontWeight="600" color="text.secondary" mb="3">
          NFT 质押说明
        </Text>
        <VStack gap="2" align="stretch">
          <RuleItem text="NFT 作为身份凭证，提供额外收益加成" />
          <RuleItem text="不同等级 NFT 收益加成不同" />
          <RuleItem text="质押期间 NFT 不可转让" />
        </VStack>
      </Box>
    </VStack>
  )
}

interface NFTCardProps {
  nft: NFTItem
  selected: boolean
  onSelect: () => void
  delay: number
}

function NFTCard({ nft, selected, onSelect, delay }: NFTCardProps) {
  return (
    <MotionFlex
      direction="column"
      bg="bg.card"
      borderRadius="14px"
      overflow="hidden"
      border="2px solid"
      borderColor={selected ? 'brand.primary' : 'border.default'}
      cursor="pointer"
      onClick={onSelect}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, delay }}
      whileTap={{ scale: 0.98 }}
      position="relative"
    >
      {selected && (
        <Box
          position="absolute"
          top="2"
          right="2"
          zIndex="1"
          color="brand.primary"
        >
          <HiOutlineCheckCircle size={24} />
        </Box>
      )}
      <Box
        h="100px"
        bg={`linear-gradient(135deg, ${getCategoryColor(nft.category)} 0%, rgba(0,0,0,0.3) 100%)`}
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <NFTImage
          src={nft.imageUrl}
          alt={nft.name}
          w="60px"
          h="60px"
        />
      </Box>
      <Box p="3">
        <Text fontSize="sm" fontWeight="600" color="text.primary" truncate>
          {nft.name}
        </Text>
        <Text fontSize="xs" color="text.muted" textTransform="capitalize">
          {nft.category}
        </Text>
      </Box>
    </MotionFlex>
  )
}

interface StakedNFTItemProps {
  nft: NFTItem
  onUnstake: () => void
  isProcessing: boolean
  delay: number
}

function StakedNFTItem({ nft, onUnstake, isProcessing, delay }: StakedNFTItemProps) {
  const stakeDays = nft.stakedAt
    ? Math.floor((Date.now() - nft.stakedAt) / 86400000)
    : 0

  return (
    <MotionFlex
      bg="bg.card"
      borderRadius="14px"
      p="3"
      border="1px solid"
      borderColor="accent.purple"
      align="center"
      gap="3"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
    >
      <Box
        w="60px"
        h="60px"
        borderRadius="10px"
        bg={`linear-gradient(135deg, ${getCategoryColor(nft.category)} 0%, rgba(0,0,0,0.3) 100%)`}
        display="flex"
        alignItems="center"
        justifyContent="center"
        flexShrink={0}
      >
        <NFTImage
          src={nft.imageUrl}
          alt={nft.name}
          w="40px"
          h="40px"
        />
      </Box>
      <Box flex="1">
        <Text fontSize="sm" fontWeight="600" color="text.primary">
          {nft.name}
        </Text>
        <Text fontSize="xs" color="text.muted">
          已质押 {stakeDays} 天
        </Text>
      </Box>
      <ActionButton
        variant="outline"
        size="sm"
        h="36px"
        px="4"
        onClick={onUnstake}
        loading={isProcessing}
      >
        取消
      </ActionButton>
    </MotionFlex>
  )
}

function EmptyState({ text }: { text: string }) {
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
      <HiOutlineCube size={32} color="#71717A" />
      <Text fontSize="sm" color="text.muted" mt="2">
        {text}
      </Text>
    </Flex>
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
    bronze: 'rgba(205, 127, 50, 0.4)',
    silver: 'rgba(192, 192, 192, 0.4)',
    gold: 'rgba(255, 215, 0, 0.4)',
    platinum: 'rgba(229, 228, 226, 0.4)',
    diamond: 'rgba(185, 242, 255, 0.4)',
  }
  return colors[category] || colors.bronze
}
