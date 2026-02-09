import { Box, Flex, HStack, Input, SimpleGrid, Text } from '@chakra-ui/react'
import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  HiOutlineBolt,
  HiOutlineClipboardDocumentList,
  HiOutlineFire,
  HiOutlineShieldCheck,
} from 'react-icons/hi2'
import { useNavigate } from 'react-router-dom'
import { ActionButton } from '../common'
import { ProgressOverlay } from '../nft'
import { usePICBurn } from '../../hooks/usePICBurn'
import { usePayFiStore } from '../../stores/payfiStore'

const MotionBox = motion.create(Box)

export function BurnSection() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { userAssets, priceInfo, nftLevelConfigs, fetchUserAssets } = usePayFiStore()

  const {
    isLoading: isBurnLoading,
    step: burnStep,
    burnPIC: executeBurn,
    reset: resetBurn,
    getStatusText: getBurnStatusText,
  } = usePICBurn()

  const [burnUsdtAmount, setBurnUsdtAmount] = useState('')
  const [burnError, setBurnError] = useState<string | null>(null)

  const isStakingEnabled = userAssets?.featureFlags?.pidStakingEnabled ?? false
  const showBurnOverlay = burnStep !== 'idle'

  const getBurnProgress = () => {
    switch (burnStep) {
      case 'preparing': return 1
      case 'signing': return 2
      case 'confirming': return 3
      case 'submitting': return 4
      case 'success': return 4
      case 'error': return 0
      default: return 0
    }
  }

  // 滚动穿透修复
  useEffect(() => {
    if (showBurnOverlay) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [showBurnOverlay])

  const getNFTConfig = (level: string | null) => {
    if (!level || nftLevelConfigs.length === 0) return null
    return nftLevelConfigs.find(c => c.level === level) || null
  }

  const burnUsdtValue = burnUsdtAmount ? parseFloat(burnUsdtAmount) : 0
  const isValidBurnAmount = burnUsdtValue >= 100 && burnUsdtValue % 100 === 0
  const estimatedPicAmount = burnUsdtValue && priceInfo?.picPrice ? burnUsdtValue / priceInfo.picPrice : 0

  const currentNFTConfig = getNFTConfig(userAssets?.currentNFTLevel || null)
  const burnMultiplier = currentNFTConfig?.burnExitMultiplier || 3.0

  const estimatedPowerAdded = isValidBurnAmount ? burnUsdtValue : 0
  const estimatedExitAdded = isValidBurnAmount ? burnUsdtValue * burnMultiplier : 0

  const hasEnoughBalance = estimatedPicAmount <= (userAssets?.walletPicBalance || 0)

  const quickAmounts = [100, 500, 1000, 3000, 10000]

  const handleBurn = async () => {
    if (!burnUsdtAmount || !isValidBurnAmount || isBurnLoading) return

    if (!hasEnoughBalance) {
      setBurnError(t('assets.insufficient_pic_balance'))
      return
    }

    setBurnError(null)
    resetBurn()

    try {
      const usdtAmount = parseFloat(burnUsdtAmount)
      const success = await executeBurn(usdtAmount)
      if (success) {
        setBurnUsdtAmount('')
        await fetchUserAssets()
      }
    } catch {
      setBurnError(t('assets.burn_failed'))
    }
  }

  return (
    <>
      <Box>
        <Flex justify="space-between" align="center" mb="3">
          <HStack gap={2}>
            <HiOutlineFire size={18} color="#8A8A90" />
            <Text fontSize="sm" fontWeight="600" color="whiteAlpha.600">
              {t('assets.burn_pic_title')}
            </Text>
          </HStack>
          <Flex
            align="center"
            gap="1"
            color="whiteAlpha.500"
            cursor="pointer"
            onClick={() => navigate('/burn-records')}
            _hover={{ color: '#5A5A60' }}
            transition="color 0.2s"
          >
            <HiOutlineClipboardDocumentList size={16} />
            <Text fontSize="xs">{t('assets.records')}</Text>
          </Flex>
        </Flex>

        <MotionBox
          bg="#17171C"
          borderRadius="xl"
          p="4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {/* 输入框 */}
          <Box mb="3">
            <Text fontSize="xs" color="whiteAlpha.500" mb="2">
              {t('assets.burn_usdt_label')}
            </Text>
            <Input
              disabled={!isStakingEnabled}
              type="number"
              min="100"
              step="100"
              placeholder={t('assets.enter_burn_usdt')}
              value={burnUsdtAmount}
              autoComplete="off"
              onChange={(e) => {
                setBurnUsdtAmount(e.target.value)
                setBurnError(null)
              }}
              bg="whiteAlpha.50"
              border="1px solid"
              borderColor="whiteAlpha.200"
              borderRadius="xl"
              color="white"
              fontSize="lg"
              h="12"
              pl="4"
              _placeholder={{ color: 'whiteAlpha.400' }}
              _focus={{
                borderColor: 'whiteAlpha.600',
                boxShadow: '0 0 0 1px rgba(255, 255, 255, 0.5)',
              }}
            />
            <Flex justify="space-between" mt="1">
              <Text fontSize="xs" color="whiteAlpha.400">
                {t('assets.wallet_balance')}: {userAssets?.walletPicBalance?.toFixed(2) || '0.00'} PIC
              </Text>
              {burnUsdtAmount && (
                <Text
                  fontSize="xs"
                  color={isValidBurnAmount && hasEnoughBalance ? '#22C55E' : 'red.400'}
                >
                  ≈ {estimatedPicAmount.toFixed(2)} PIC
                  {!isValidBurnAmount && burnUsdtValue > 0 && ` (${t('assets.must_be_100u')})`}
                  {isValidBurnAmount && !hasEnoughBalance && ` (${t('assets.insufficient_pic_balance')})`}
                </Text>
              )}
            </Flex>
          </Box>

          {/* 快捷金额 */}
          <HStack gap={2} mb="4">
            {quickAmounts.map((amount) => {
              const isSelected = burnUsdtAmount === String(amount)
              return (
                <ActionButton
                  key={amount}
                  variant={isSelected ? 'primary' : 'outline'}
                  size="sm"
                  flex={1}
                  disabled={!isStakingEnabled}
                  onClick={() => setBurnUsdtAmount(String(amount))}
                  bg={isSelected ? 'whiteAlpha.200' : undefined}
                >
                  ${amount}
                </ActionButton>
              )
            })}
          </HStack>

          {/* 预估结果 */}
          {isValidBurnAmount && (
            <Box bg="whiteAlpha.50" borderRadius="lg" p="3" mb="4">
              <Text fontSize="xs" color="whiteAlpha.600" mb="2">
                {t('assets.estimated_increase')}
              </Text>
              <SimpleGrid columns={2} gap={3}>
                <HStack>
                  <HiOutlineBolt size={16} color="#8A8A90" />
                  <Box>
                    <Text fontSize="xs" color="whiteAlpha.500">
                      {t('assets.power')}
                    </Text>
                    <Text fontSize="md" fontWeight="bold" color="white">
                      +{estimatedPowerAdded.toLocaleString()}
                    </Text>
                  </Box>
                </HStack>
                <HStack>
                  <HiOutlineShieldCheck size={16} color="#8A8A90" />
                  <Box>
                    <Text fontSize="xs" color="whiteAlpha.500">
                      {t('assets.exit_limit')}
                    </Text>
                    <Text fontSize="md" fontWeight="bold" color="white">
                      +${estimatedExitAdded.toLocaleString()}
                    </Text>
                  </Box>
                </HStack>
              </SimpleGrid>
              <Text fontSize="xs" color="whiteAlpha.400" mt="2">
                {t('assets.current_level')} {userAssets?.currentNFTLevel || 'N/A'} {t('assets.burn_multiplier')}:{' '}
                {burnMultiplier}x
              </Text>
            </Box>
          )}

          {/* 错误提示 */}
          {(burnError || burnStep === 'error') && (
            <Text fontSize="sm" color="red.400" mb="3">
              {burnError || getBurnStatusText()}
            </Text>
          )}

          {/* 销毁状态提示 */}
          {isBurnLoading && (
            <Text fontSize="sm" color="whiteAlpha.600" mb="3" textAlign="center">
              {getBurnStatusText()}
            </Text>
          )}

          {/* 销毁按钮 */}
          <ActionButton
            variant="primary"
            w="full"
            onClick={handleBurn}
            disabled={!isStakingEnabled || isBurnLoading || !isValidBurnAmount || !hasEnoughBalance}
          >
            {isBurnLoading ? t('assets.processing') : t('assets.confirm_burn')}
          </ActionButton>

          {!userAssets?.currentNFTLevel && (
            <Text fontSize="xs" color="whiteAlpha.400" textAlign="center" mt="2">
              {t('assets.need_nft_to_burn')}
            </Text>
          )}
        </MotionBox>
      </Box>

      {/* 销毁进度蒙版 */}
      <AnimatePresence>
        {showBurnOverlay && (
          <ProgressOverlay
            progress={getBurnProgress()}
            totalSteps={4}
            isSuccess={burnStep === 'success'}
            isError={burnStep === 'error'}
            isSigningStep={burnStep === 'signing'}
            statusText={getBurnStatusText()}
            onClose={() => {
              resetBurn()
              if (burnStep === 'success') {
                setBurnUsdtAmount('')
                fetchUserAssets()
              }
            }}
          />
        )}
      </AnimatePresence>
    </>
  )
}
