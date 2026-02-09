import { Box, Button, Flex, HStack, Input, Text } from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { HiOutlineClipboardDocumentList, HiOutlineLockClosed } from 'react-icons/hi2'
import { useNavigate } from 'react-router-dom'
import { ActionButton } from '../common'
import { usePayFiStore } from '../../stores/payfiStore'

const MotionBox = motion.create(Box)

const STAKE_OPTIONS = [
  { id: 'm3', labelKey: 'assets.stake_period_m3', duration: 90, apy: 0.00, minAmount: 0 },
  { id: 'm6', labelKey: 'assets.stake_period_m6', duration: 180, apy: 0.00, minAmount: 0 },
  { id: 'm12', labelKey: 'assets.stake_period_m12', duration: 360, apy: 0.00, minAmount: 0 },
]

export function StakingSection() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { userAssets, fetchUserAssets } = usePayFiStore()

  const [stakeAmount, setStakeAmount] = useState('')
  const [selectedStakePeriod, setSelectedStakePeriod] = useState('m3')
  const [isStaking, setIsStaking] = useState(false)
  const [stakeError, setStakeError] = useState<string | null>(null)

  const isStakingEnabled = userAssets?.featureFlags?.pidStakingEnabled ?? false
  const currentStakeOption = STAKE_OPTIONS.find(o => o.id === selectedStakePeriod) || STAKE_OPTIONS[0]
  const isValidStakeAmount =
    stakeAmount &&
    !isNaN(parseFloat(stakeAmount)) &&
    parseFloat(stakeAmount) >= currentStakeOption.minAmount &&
    parseFloat(stakeAmount) <= (userAssets?.pidBalance || 0)

  const handleStake = async () => {
    if (!stakeAmount || !isValidStakeAmount || isStaking) return

    setStakeError(null)
    setIsStaking(true)

    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      setStakeAmount('')
      await fetchUserAssets()
    } catch {
      setStakeError(t('assets.stake_failed'))
    } finally {
      setIsStaking(false)
    }
  }

  return (
    <Box>
      <Flex justify="space-between" align="center" mb="3">
        <HStack gap={2}>
          <HiOutlineLockClosed size={18} color="#8A8A90" />
          <Text fontSize="sm" fontWeight="600" color="whiteAlpha.600">
            {t('assets.stake_pid_title')}
          </Text>
        </HStack>
        <Flex
          align="center"
          gap="1"
          color="whiteAlpha.500"
          cursor="pointer"
          onClick={() => navigate('/stake-records')}
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
        transition={{ delay: 0.18 }}
      >
        {/* 周期选择 */}
        <HStack mb="4" bg="black" p="1" borderRadius="lg">
          {STAKE_OPTIONS.map((option) => (
            <Button
              disabled={!isStakingEnabled}
              key={option.id}
              flex={1}
              size="sm"
              variant={selectedStakePeriod === option.id ? 'solid' : 'ghost'}
              bg={selectedStakePeriod === option.id ? 'whiteAlpha.200' : 'transparent'}
              color={selectedStakePeriod === option.id ? 'white' : 'whiteAlpha.500'}
              _hover={{ bg: selectedStakePeriod === option.id ? 'whiteAlpha.200' : 'whiteAlpha.50' }}
              onClick={() => setSelectedStakePeriod(option.id)}
            >
              {t(option.labelKey)}
            </Button>
          ))}
        </HStack>

        {/* 输入框 */}
        <Box position="relative" mb="3">
          <Input
            disabled={!isStakingEnabled}
            type="number"
            min="0"
            placeholder={t('assets.enter_stake_amount')}
            value={stakeAmount}
            autoComplete="off"
            onChange={(e) => {
              setStakeAmount(e.target.value)
              setStakeError(null)
            }}
            bg="whiteAlpha.50"
            border="1px solid"
            borderColor="whiteAlpha.200"
            borderRadius="xl"
            color="white"
            fontSize="lg"
            h="12"
            pl="4"
            pr="20"
            _placeholder={{ color: 'whiteAlpha.400' }}
            _focus={{
              borderColor: 'whiteAlpha.600',
              boxShadow: '0 0 0 1px rgba(255, 255, 255, 0.5)',
            }}
          />
          <Button
            disabled={!isStakingEnabled}
            size="xs"
            position="absolute"
            right="3"
            top="50%"
            transform="translateY(-50%)"
            zIndex={2}
            bg="whiteAlpha.200"
            color="whiteAlpha.800"
            _hover={{ bg: 'whiteAlpha.300' }}
            onClick={() => setStakeAmount(userAssets?.pidBalance.toString() || '0')}
          >
            ALL
          </Button>
        </Box>

        <Flex justify="space-between" mb="4">
          <Text fontSize="xs" color="whiteAlpha.400">
            {t('assets.available')}: {userAssets?.pidBalance.toFixed(2) || '0.00'} PID
          </Text>
        </Flex>

        {/* 信息展示 */}
        <Box mb="4">
          <HStack justify="space-between" mb="2">
            <Text fontSize="sm" color="whiteAlpha.600">
              {t('assets.lock_period')}
            </Text>
            <Text fontSize="sm" color="white">
              {currentStakeOption.duration} {t('assets.stake_days')}
            </Text>
          </HStack>
          <HStack justify="space-between">
            <Text fontSize="sm" color="whiteAlpha.600">
              {t('assets.apy')}
            </Text>
            <Text fontSize="sm" color="white">
              {(currentStakeOption.apy * 100).toFixed(0)}%
            </Text>
          </HStack>
        </Box>

        {stakeError && (
          <Text fontSize="sm" color="red.400" mb="3">
            {stakeError}
          </Text>
        )}

        <ActionButton
          variant="primary"
          w="full"
          onClick={handleStake}
          disabled={!isStakingEnabled}
        >
          {isStaking ? t('assets.processing') : t('assets.confirm_stake')}
        </ActionButton>

        <Text fontSize="xs" color="whiteAlpha.400" textAlign="center" mt="2">
          {t('assets.min_stake_amount', { amount: currentStakeOption.minAmount })}
        </Text>
      </MotionBox>
    </Box>
  )
}
