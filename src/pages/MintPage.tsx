import { useState, useEffect } from 'react'
import { Box, Flex, Text, VStack, SimpleGrid, Spinner } from '@chakra-ui/react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { PageHeader, ActionButton, NFTImage } from '../components/common'
import { usePayFiStore } from '../stores/payfiStore'
import { useNFTPurchase, type PurchaseStep } from '../hooks/useNFTPurchase'
import type { NFTLevel } from '../types/payfi'
import type { NFTLevel as ApiNFTLevel } from '../api/types'
import {
  HiOutlineSparkles,
  HiOutlineCube,
  HiOutlineCheckCircle,
  HiOutlineExclamationCircle,
} from 'react-icons/hi2'

const MotionBox = motion.create(Box)

// NFT 等级配置 - 与后端 nft_level_config 保持一致
interface NFTTier {
  id: NFTLevel
  name: string
  price: number       // USDT
  power: number       // 基础算力
  coefficient: number // 挖矿系数
  boost: string       // 显示用的加成百分比
}

const nftTiers: NFTTier[] = [
  {
    id: 'N1',
    name: 'N1',
    price: 100,
    power: 100,
    coefficient: 0.7,
    boost: '0.7x',
  },
  {
    id: 'N2',
    name: 'N2',
    price: 500,
    power: 500,
    coefficient: 0.8,
    boost: '0.8x',
  },
  {
    id: 'N3',
    name: 'N3',
    price: 1000,
    power: 1000,
    coefficient: 0.9,
    boost: '0.9x',
  },
  {
    id: 'N4',
    name: 'N4',
    price: 3000,
    power: 3000,
    coefficient: 1.0,
    boost: '1.0x',
  },
  {
    id: 'N5',
    name: 'N5',
    price: 10000,
    power: 10000,
    coefficient: 1.1,
    boost: '1.1x',
  },
]

export function MintPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [selectedTier, setSelectedTier] = useState<NFTLevel>(null)

  // 从 payfiStore 获取价格信息
  const { priceInfo, fetchHomeData } = usePayFiStore()

  // 使用 NFT 购买钩子
  const {
    step,
    isLoading,
    error,
    orderId,
    purchaseNFT,
    reset,
    getStatusText,
  } = useNFTPurchase()

  // 页面加载时获取数据
  useEffect(() => {
    fetchHomeData()
  }, [fetchHomeData])

  // 购买成功后跳转
  useEffect(() => {
    if (step === 'success' && orderId) {
      // 购买完成，延迟跳转让用户看到成功状态
      const timer = setTimeout(() => {
        navigate(`/nft/orders/${orderId}`)
      }, 1500)
      return () => clearTimeout(timer)
    }
  }, [step, orderId, navigate])

  const handleMint = async () => {
    if (!selectedTier) return

    const tier = nftTiers.find((t) => t.id === selectedTier)
    if (!tier) return

    // 检查 PID 价格（用于计算需要支付的 PID 数量）
    if (!priceInfo?.pidPrice) {
      alert(t('mint.price_unavailable'))
      return
    }

    // 执行购买流程（类型已通过上面的 null 检查）
    const success = await purchaseNFT(selectedTier as ApiNFTLevel, false)

    if (success) {
      // 刷新用户资产数据
      await fetchHomeData()
      setSelectedTier(null)
    }
  }

  const selected = nftTiers.find((t) => t.id === selectedTier)

  // 计算需要支付的 PID 数量
  const getRequiredPID = (priceUsdt: number): string => {
    if (!priceInfo?.pidPrice || priceInfo.pidPrice <= 0) {
      return '--'
    }
    return (priceUsdt / priceInfo.pidPrice).toFixed(2)
  }

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

        {/* 当前价格信息 */}
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
            PID {t('mint.current_price')}
          </Text>
          <Text fontSize="sm" fontWeight="600" color="text.primary">
            {priceInfo?.pidPrice ? `$${priceInfo.pidPrice.toFixed(4)}` : '--'}
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
                pidAmount={getRequiredPID(tier.price)}
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
                  {selected.price} USDT
                </Text>
              </Box>
              <Box>
                <Text fontSize="xs" color="text.muted">
                  {t('mint.pay_pid')}
                </Text>
                <Text fontSize="md" fontWeight="600" color="brand.primary">
                  ≈ {getRequiredPID(selected.price)} PID
                </Text>
              </Box>
              <Box>
                <Text fontSize="xs" color="text.muted">
                  {t('mint.power')}
                </Text>
                <Text fontSize="md" fontWeight="600" color="text.primary">
                  {selected.power}
                </Text>
              </Box>
              <Box>
                <Text fontSize="xs" color="text.muted">
                  {t('mint.coefficient')}
                </Text>
                <Text fontSize="md" fontWeight="600" color="accent.green">
                  {selected.boost}
                </Text>
              </Box>
            </SimpleGrid>

            {/* 错误提示 */}
            {error && (
              <Text fontSize="xs" color="error" textAlign="center" mb="3">
                {error}
              </Text>
            )}

            {/* 加载状态 */}
            {isLoading && (
              <Text fontSize="xs" color="brand.primary" textAlign="center" mb="3">
                {getStatusText()}
              </Text>
            )}

            <ActionButton
              w="100%"
              variant="primary"
              onClick={handleMint}
              loading={isLoading}
              loadingText={getStatusText()}
              disabled={isLoading}
            >
              <Flex align="center" gap="2">
                <HiOutlineCube size={18} />
                <Text>{t('mint.confirm_mint_button')}</Text>
              </Flex>
            </ActionButton>

            {/* 重置按钮（如果有错误） */}
            {error && !isLoading && (
              <ActionButton
                w="100%"
                variant="ghost"
                onClick={reset}
                mt="2"
              >
                {t('common.retry')}
              </ActionButton>
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

      {/* 购买流程蒙版 */}
      <PurchaseOverlay step={step} statusText={getStatusText()} onClose={reset} />
    </Box>
  )
}

interface NFTTierCardProps {
  tier: NFTTier
  selected: boolean
  onSelect: () => void
  delay: number
  pidAmount: string
}

function NFTTierCard({ tier, selected, onSelect, delay, pidAmount }: NFTTierCardProps) {
  const { t } = useTranslation()

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
          bg={`linear-gradient(135deg, ${getLevelColor(tier.id)} 0%, rgba(0,0,0,0.3) 100%)`}
          align="center"
          justify="center"
          flexShrink={0}
        >
          <NFTImage
            src={`/nft-${tier.id?.toLowerCase() || 'n1'}.png`}
            alt={tier.name}
            w="50px"
            h="50px"
            fallbackText={tier.name}
          />
        </Flex>

        {/* 信息 */}
        <Box flex="1">
          <Flex justify="space-between" align="flex-start" mb="1">
            <Text fontSize="md" fontWeight="700" color="text.primary">
              {tier.name}
            </Text>
            <Text fontSize="sm" fontWeight="600" color="accent.green">
              {tier.boost}
            </Text>
          </Flex>

          <Text fontSize="lg" fontWeight="600" color="brand.primary" mb="1">
            {tier.price} USDT
          </Text>

          <Flex justify="space-between" align="center">
            <Text fontSize="xs" color="text.muted">
              ≈ {pidAmount} PID
            </Text>
            <Text fontSize="xs" color="text.muted">
              {t('mint.power')}: {tier.power}
            </Text>
          </Flex>
        </Box>
      </Flex>

      {/* 选中时显示更多信息 */}
      {selected && (
        <Box mt="4" pt="3" borderTop="1px solid" borderColor="border.default">
          <Flex gap="4" justify="space-between">
            <Box>
              <Text fontSize="xs" color="text.muted" mb="1">
                {t('mint.exit_multiplier')}
              </Text>
              <Text fontSize="sm" fontWeight="600" color="text.primary">
                2.0x
              </Text>
            </Box>
            <Box>
              <Text fontSize="xs" color="text.muted" mb="1">
                {t('mint.burn_exit_multiplier')}
              </Text>
              <Text fontSize="sm" fontWeight="600" color="text.primary">
                {getBurnExitMultiplier(tier.id)}x
              </Text>
            </Box>
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

// 获取 NFT 等级对应的颜色
function getLevelColor(level: NFTLevel): string {
  const colors: Record<string, string> = {
    N1: 'rgba(205, 127, 50, 0.6)',  // Bronze
    N2: 'rgba(192, 192, 192, 0.6)', // Silver
    N3: 'rgba(255, 215, 0, 0.6)',   // Gold
    N4: 'rgba(229, 228, 226, 0.6)', // Platinum
    N5: 'rgba(185, 242, 255, 0.6)', // Diamond
  }
  return colors[level || 'N1'] || colors.N1
}

// 获取销毁出局倍数
function getBurnExitMultiplier(level: NFTLevel): string {
  const multipliers: Record<string, string> = {
    N1: '3.0',
    N2: '3.0',
    N3: '3.0',
    N4: '3.5',
    N5: '4.0',
  }
  return multipliers[level || 'N1'] || '3.0'
}

// 购买流程蒙版组件
interface PurchaseOverlayProps {
  step: PurchaseStep
  statusText: string
  onClose: () => void
}

function PurchaseOverlay({ step, statusText, onClose }: PurchaseOverlayProps) {
  const { t } = useTranslation()

  // 只在有活动步骤时显示
  const isVisible = step !== 'idle'

  // 获取步骤图标
  const getStepIcon = () => {
    switch (step) {
      case 'success':
        return <HiOutlineCheckCircle size={48} color="#FFFFFF" />
      case 'error':
        return <HiOutlineExclamationCircle size={48} color="#9CA3AF" />
      default:
        return <Spinner size="xl" color="whiteAlpha.700" borderWidth="4px" />
    }
  }

  // 获取步骤进度
  const getStepProgress = () => {
    const steps: PurchaseStep[] = ['creating', 'signing', 'submitting', 'verifying', 'minting', 'success']
    const currentIndex = steps.indexOf(step)
    return currentIndex >= 0 ? currentIndex + 1 : 0
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <MotionBox
          position="fixed"
          top="0"
          left="0"
          right="0"
          bottom="0"
          bg="rgba(0, 0, 0, 0.7)"
          backdropFilter="blur(4px)"
          display="flex"
          alignItems="center"
          justifyContent="center"
          zIndex="1000"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={step === 'error' || step === 'success' ? onClose : undefined}
        >
          <MotionBox
            bg="bg.card"
            borderRadius="20px"
            p="8"
            mx="4"
            maxW="320px"
            w="100%"
            textAlign="center"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={(e: React.MouseEvent) => e.stopPropagation()}
          >
            {/* 图标 */}
            <Flex justify="center" mb="6">
              {getStepIcon()}
            </Flex>

            {/* 状态文字 */}
            <Text
              fontSize="lg"
              fontWeight="600"
              color={step === 'error' ? 'whiteAlpha.600' : 'white'}
              mb="3"
            >
              {statusText}
            </Text>

            {/* 进度指示器 */}
            {step !== 'error' && step !== 'success' && (
              <Box mb="4">
                <Flex justify="center" gap="2" mb="2">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Box
                      key={i}
                      w="8px"
                      h="8px"
                      borderRadius="full"
                      bg={i <= getStepProgress() ? 'white' : 'whiteAlpha.300'}
                      transition="background 0.3s"
                    />
                  ))}
                </Flex>
                <Text fontSize="xs" color="whiteAlpha.500">
                  {t('mint.step')} {getStepProgress()} / 5
                </Text>
              </Box>
            )}

            {/* 提示文字 */}
            {step === 'signing' && (
              <Text fontSize="xs" color="text.muted" mt="2">
                {t('mint.wallet_confirm_hint')}
              </Text>
            )}

            {/* 关闭按钮（仅在成功或失败时显示） */}
            {(step === 'error' || step === 'success') && (
              <ActionButton
                variant={step === 'success' ? 'primary' : 'ghost'}
                onClick={onClose}
                mt="4"
                w="100%"
              >
                {step === 'success' ? t('common.continue') : t('common.close')}
              </ActionButton>
            )}
          </MotionBox>
        </MotionBox>
      )}
    </AnimatePresence>
  )
}
